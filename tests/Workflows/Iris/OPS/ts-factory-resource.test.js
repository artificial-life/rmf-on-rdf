'use strict'

let _ = require('lodash');
let uuid = require('node-uuid');

let CouchbirdLinkedDataProvider = require(_base + '/build/externals/CouchbirdLinkedDataProvider.js');
let RDFcb = require("cbird-rdf").LD;
let LDCacheAccessor = require(_base + '/build/Classes/Atomic/Accessor/LDCacheAccessor');
let Couchbird = require("couchbird");

let TSFactoryDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/TSFactoryDataProvider.js');
let IngredientDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/IngredientDataProvider.js');
let ResourceFactoryAsync = require(_base + '/build/Classes/ResourceFactoryAsync.js');
var BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor.js');
var LDAccessor = require(_base + '/build/Classes/Atomic/Accessor/LDAccessor.js');
var ContentAsync = require(_base + '/build/Classes/ContentAsync.js');

let HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
let AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');


describe.only('Workflow: TS Factory ', () => {
	let vocab_basic = require(_base + "/tests/data/iris_basic.json");
	let vocab_domain = require(_base + "/tests/data/iris_domain.json");
	let test_data = require(_base + "/tests/data/data_expanded.json");
	let keymakers = require(_base + "/tests/Workflows/Iris/OPS/keymakers");
	let cfg = {
		"couchbird": {
			"server_ip": "127.0.0.1",
			"n1ql": "127.0.0.1:8093"
		},
		"buckets": {
			"main": "rdf",
			"auth": "ss",
			"history": "rdf"
		},
		"vocabulary": {
			"basic": "iris://vocabulary/basic",
			"domain": "iris://vocabulary/domain",
			"fs": false
		},
		"data_prefix": "iris://data"
	};

	let classmap = {
		common_id: new RegExp("(.*)#([^-]*)-([^\/]*)"),
		classes: {
			plan: {
				template: {
					type: "schedule"
				},
				map_keys: {
					"iris://vocabulary/domain#scheduleOf": "iris://vocabulary/domain#planOf"
				},
				map_values: {
					"iris://vocabulary/domain#hasTimeDescription": function(value) {
						let parsed = JSON.parse(value[0]['@value']);
						return _.map(parsed, (chunk) => {
							return {
								data: [chunk],
								state: 'a'
							};
						});
					}
				},
				typecast: "iris://vocabulary/domain#Plan"
			}
		}
	};

	let db = null;
	let bucket = null;
	let dp = null;
	let accessor = null;
	let resource_source = null;

	let factory_accessor = null;
	let factory = null;

	before(() => {
		db = new RDFcb(cfg.couchbird);
		bucket = db.bucket(cfg.buckets.main);
		bucket.upsert("iris://vocabulary/basic", vocab_basic);
		bucket.upsert("iris://vocabulary/domain", vocab_domain);
		bucket.N1QL(Couchbird.N1qlQuery.fromString("CREATE PRIMARY INDEX ON " + cfg.buckets.main + ";"))
			// bucket.installViews();
			// bucket.setVocabulary(cfg.vocabulary);
		bucket.upsertNodes(test_data);
		bucket.removeNodes("iris://data#plan-1");
		dp = new CouchbirdLinkedDataProvider(bucket);


		let ops_plan_accessor = new LDCacheAccessor(dp);
		ops_plan_accessor.mapper(classmap);
		let services_accessor = new LDCacheAccessor(dp);
		services_accessor.mapper(classmap);

		ops_plan_accessor.keymaker('get', keymakers.op_plan.get);
		ops_plan_accessor.keymaker('set', keymakers.op_plan.set);
		services_accessor.keymaker('get', keymakers.op_service_plan.get);

		resource_source = new ContentAsync();

		let datamodel = {
			type: 'LDPlan',
			deco: 'BaseCollection',
			params: 'operator_id'
		};

		let plan_collection = AtomicFactory.create('BasicAsync', {
			type: datamodel,
			accessor: ops_plan_accessor
		});
		resource_source.addAtom(plan_collection, 'plan');

		let attributes_services_datamodel = {
			type: {
				type: 'LDPlan',
				deco: 'BaseCollection',
				params: 'service_id'
			},
			deco: 'BaseCollection',
			params: 'operator_id'
		};

		let operator_services_collection = AtomicFactory.create('BasicAsync', {
			type: attributes_services_datamodel,
			accessor: services_accessor
		});

		resource_source.addAtom(operator_services_collection, 'services', '<namespace>attribute');

		//@NOTE: building factory
		//@NOTE: prepare variables
		let data_model = {
			type: {
				type: {
					deco: 'Box',
					type: ['LDPlan']
				},
				deco: 'BaseCollection',
				params: 'box_id'
			},
			deco: 'BaseCollection',
			params: 'service_id'
		};


		let factory_provider = new TSFactoryDataProvider();

		factory_accessor = new BasicAccessor(factory_provider);
		factory_accessor.keymaker('set', (p) => {
				let keys = [];
				_.forEach(p, (boxes, s_id) => {
					_.forEach(boxes, (box, box_id) => {
						keys.push([s_id, box_id]);
					});
				});
				return keys;
			})
			.keymaker('get', (p) => p);

		let storage_accessor = new LDAccessor(dp);
		storage_accessor.keymaker('set', (data) => {
				let tickets = _.isArray(data) ? data : [data];
				return _.map(tickets, (ticket) => {
					let node = {};
					node['@id'] = "iris://data#" + ticket.key;
					//@TODO update the vocab with this
					node['@type'] = "iris://vocabulary/domain#Ticket";
					node["iris://vocabulary/domain#hasService"] = [{
						'@id': ticket.service
					}];
					node["iris://vocabulary/domain#hasOperator"] = [{
						'@id': ticket.operator
					}];
					node["iris://vocabulary/domain#hasState"] = ticket.state;
					return node;
				});
			})
			.keymaker('get', (p) => {
				let keys = p['id'];

				if(keys == '*') {
					//@NOTE: and?
					//@NOTE: submit view key
					//@IDEA: new View('view-name',params), parse view in DP
					return _.reduce(TEST_STORAGE, (result, item, index) => {
						if(~index.indexOf('box')) result.push(index);
						return result;
					}, []);
				}

				if(_.isArray(keys)) return keys;

				return keys;
			});

		factory_provider
			.addIngredient('ldplan', resource_source)
			.addStorage(storage_accessor);


		let box_builder = AtomicFactory.create('BasicAsync', {
			type: data_model,
			accessor: factory_accessor
		});

		let box_storage = AtomicFactory.create('BasicAsync', {
			type: data_model,
			accessor: storage_accessor
		});
		factory = new ResourceFactoryAsync();
		factory
			.addAtom(box_builder, 'box', '<namespace>builder')
			.addAtom(box_storage, 'box', '<namespace>content');

	});


	beforeEach(() => {

	});

	describe('basic observe-reserve', function() {
		this.timeout(10000);
		describe('#build', () => {
			it('build concrete', () => {

				factory.selector().reset()
					.add()
					.id('<namespace>builder').id('box').query({
						query: {
							operator_id: '*',
							day: 'Monday',
							selection: {
								service_id: 'iris://data#service-2',
								selection: [50400000, 50800000]
							}
						},
						options: {}
					});

				return Promise.resolve(true)
					.then(() => {
						return factory.build({
							count: 6,
							size: 30 * 3600
						});
					})
					.then((produced) => {
						// console.log("PRODUCED", require('util').inspect(produced.content_map, {
						// 	depth: null
						// }));
						produced.selector().reset()
							.add()
							.id('<namespace>builder').id('box').query({
								service_id: '*',
								selection: {
									box_id: '*'
								}
							});

						return produced.observe();
					})
					.then((produced) => {
						// console.log("OBSERVED", require('util').inspect(produced.content_map, {
						// 	depth: null
						// }));
						produced.selector().reset()
							.add()
							.id('<namespace>builder').id('box').query({
								service_id: '*',
								selection: {
									box_id: '2'
								}
							});

						produced.reserve();
						console.log("RESERVED", require('util').inspect(produced.content_map, {
							depth: null
						}));
						return produced.save();
					})
					.then((saved) => {
						console.log("SAVED", require('util').inspect(saved, {
							depth: null
						}));

					})
			});
		});
	})
})