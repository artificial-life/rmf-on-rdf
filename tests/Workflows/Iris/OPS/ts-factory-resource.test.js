'use strict'
let RDFcb = require("cbird-rdf").LD;
let Couchbird = require("couchbird");

let TSFactoryDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/TSFactoryDataProvider');
let TSIngredientDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/TSIngredientDataProvider');
let CouchbirdLinkedDataProvider = require(_base + '/build/externals/CouchbirdLinkedDataProvider');

let LDCacheAccessor = require(_base + '/build/Classes/Atomic/Accessor/LDCacheAccessor');
let BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor');
let LDAccessor = require(_base + '/build/Classes/Atomic/Accessor/LDAccessor.js');

let ContentAsync = require(_base + '/build/Classes/ContentAsync');
let ResourceFactoryAsync = require(_base + '/build/Classes/ResourceFactoryAsync');

let Ticket = require(_base + '/build/Classes/Atomic/BaseTypes/Ticket');

let AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory');


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
					type: () => "schedule",
					id: (id) => {
						return id.split('--')[0];
					}
				},
				map_keys: {
					"iris://vocabulary/domain#scheduleOf": "iris://vocabulary/domain#planOf"
				},
				map_values: {
					"iris://vocabulary/domain#hasTimeDescription": function(value) {
						return JSON.parse(value[0]['@value']);
					}
				},
				typecast: "iris://vocabulary/domain#Plan"
			}
		}
	};

	let db = null;
	let bucket = null;
	let dp = null;
	let storage_accessor = null;
	let resource_source = null;

	let factory_accessor = null;
	let factory = null;

	let DEFAULT_TS_SIZE = 15 * 3600;

	before(() => {
		db = new RDFcb(cfg.couchbird);
		bucket = db.bucket(cfg.buckets.main);
		bucket.upsert("iris://vocabulary/basic", vocab_basic);
		bucket.upsert("iris://vocabulary/domain", vocab_domain);
		bucket.N1QL(Couchbird.N1qlQuery.fromString("CREATE PRIMARY INDEX ON " + cfg.buckets.main + ";"))
		bucket.installViews();
		// bucket.setVocabulary(cfg.vocabulary);
		bucket.upsertNodes(test_data);
		bucket.removeNodes("iris://data#plan-1--2015-12-21");
		bucket.removeNodes("iris://data#plan-2--2015-12-21");
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

		let data_model = {
			type: {
				deco: 'Box',
				type: ['LDPlan']
			},
			deco: 'BaseCollection',
			params: 'box_id'
		};
		let storage_data_model = {
			type: 'Ticket',
			deco: 'BaseCollection',
			params: 'ticket_id'
		};

		let factory_provider = new TSFactoryDataProvider();
		let plans_provider = new TSIngredientDataProvider();
		plans_provider
			.setIngredient('ldplan', resource_source)
			.setSize(DEFAULT_TS_SIZE);

		factory_accessor = new BasicAccessor(factory_provider);
		factory_accessor.keymaker('set', (p) => {
				return _.keys(p);
			})
			.keymaker('get', (p) => p);

		storage_accessor = new LDAccessor(dp);
		storage_accessor.keymaker('set', keymakers.ticket.set)
			.keymaker('get', keymakers.ticket.get);

		factory_provider
			.addIngredient('ldplan', plans_provider)
			.addStorage(storage_accessor)
			.addFinalizedModel(Ticket);


		let box_builder = AtomicFactory.create('BasicAsync', {
			type: data_model,
			accessor: factory_accessor
		});

		let box_storage = AtomicFactory.create('BasicAsync', {
			type: storage_data_model,
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
						selection: {
							ldplan: {
								operator_id: '*',
								date: 'Mon, 21 Dec 2015 00:00:00 GMT', //UTC string or any object valid for new Date(obj)
								selection: {
									service_id: 'iris://data#service-2',
									selection: [40000000, 60000000]
								}
							}
						}
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
								box_id: '2'
							});

						return produced.observe();
					})
					.then((produced) => {
						// console.log("OBSERVED", require('util').inspect(produced.content_map, {
						// 	depth: null
						// }));
						//service request imitation
						let req = produced.getAtom(['<namespace>builder', 'box']).serialize()
						let rp = _.values(req)[0]['ldplan'].resolve_params;
						rp.code = "456789";
						rp.label = "P54";
						rp.user_info = "none"
						rp.destination = "none"
						rp.service_count = 1;
						rp.priority = 1;
						rp.state = 0;
						rp.booking_date = (new Date()).toUTCString();
						produced.reserve(rp);
						// console.log("RESERVED", require('util').inspect(produced.content_map, {
						// 	depth: null
						// }));
						return produced.save();
					})
					.then((saved) => {
						// console.log("SAVED", require('util').inspect(saved, {
						// 	depth: null
						// }));
						factory.selector().reset()
							.add()
							.id('<namespace>content').id('box').query({
								query: {
									id: '*',
									service: "iris://data#service-2",
									state: 0,
									priority: 1,
									label: "P54"
								},
								options: {}
							});

						return factory.build()
					})
					.then((res) => {
						console.log("BOXES", require('util').inspect(res.getAtom(["<namespace>content", 'box']).serialize(), {
							depth: null
						}));
					})
			});
		});
	})
})