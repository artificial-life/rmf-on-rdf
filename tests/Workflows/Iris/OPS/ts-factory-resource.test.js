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
						return [{
							data: parsed,
							state: 'a'
						}];
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
		bucket.installViews();
		bucket.setVocabulary(cfg.vocabulary);
		bucket.upsertNodes(test_data);
		dp = new CouchbirdLinkedDataProvider(bucket);


		let ops_plan_accessor = new LDCacheAccessor(dp);
		ops_plan_accessor.mapper(classmap);
		let services_accessor = new LDCacheAccessor(dp);
		services_accessor.mapper(classmap);

		ops_plan_accessor.keymaker('get', keymakers.op_plan.get);
		services_accessor.keymaker('get', keymakers.op_service_plan.get);

		resource_source = new ContentAsync();

		let datamodel = {
			type: 'LDPlan',
			deco: 'BaseCollection'
		};

		let plan_collection = AtomicFactory.create('BasicAsync', {
			type: datamodel,
			accessor: ops_plan_accessor
		});
		resource_source.addAtom(plan_collection, 'plan');

		let attributes_services_datamodel = {
			type: {
				type: 'LDPlan',
				deco: 'BaseCollection'
			},
			deco: 'BaseCollection'
		};

		let operator_services_collection = AtomicFactory.create('BasicAsync', {
			type: attributes_services_datamodel,
			accessor: services_accessor
		});

		resource_source.addAtom(operator_services_collection, 'services', '<namespace>attribute');

		//@NOTE: building factory
		//@NOTE: prepare variables
		let size = 10;
		let box_id = 'box_id';
		let hash_id = 'hash_id';
		let data_model = {
			type: {
				deco: 'Box',
				type: [resource_source.model_decription]
			},
			deco: 'BaseCollection'
		};


		let factory_provider = new TSFactoryDataProvider();

		factory_accessor = new BasicAccessor(factory_provider);
		factory_accessor.keymaker('set', 'build')
			.keymaker('get', (p) => p);

		let storage_accessor = new LDCacheAccessor(dp);
		storage_accessor.keymaker('set', (p) => p.key)
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
			.addIngredient('op_time', resource_source)
			.addStorage(storage_accessor);


		let box_builder = AtomicFactory.create('BasicAsync', {
			type: data_model,
			accessor: factory_accessor
		});

		let box_storage = AtomicFactory.create('BasicAsync', {
			type: data_model,
			accessor: storage_accessor
		});
		// console.log("BOX", box_builder, '\n\n', box_storage);
		factory = new ResourceFactoryAsync();
		factory
			.addAtom(box_builder, 'box', '<namespace>builder')
			.addAtom(box_storage, 'box', '<namespace>content');

		// console.log("FACTORY", factory);
	});


	beforeEach(() => {

	});

	describe('basic observe-reserve', function() {
		this.timeout(5000);
		describe('#build', () => {
			it('build concrete', () => {

				factory.selector().reset()
					.add()
					.id('<namespace>builder').id('box').query({
						query: {
							id: '*',
							day: 'Monday',
							selection: {
								id: '*',
								plan: [20, 100]
							}
						},
						options: {}
					});

				return Promise.resolve(true)
					.then(() => {
						return factory.build({
							count: 6
						});
					})
					.then((produced) => {
						console.log("PRODUCED", produced);
					})
					// 				//_.forEach(produced.getAtom(['<namespace>builder', 'box']).content, (item) => console.log(item.content.plan));
					//
					// 				produced.selector().reset()
					// 					.add()
					// 					.id('<namespace>builder').id('box').query({
					// 						id: '*',
					// 						selection: {
					// 							plan: [0, 50]
					// 						}
					// 					});
					//
					// 				produced.observe();
					//
					// 				produced.save();
					//
					// 				factory.selector().reset()
					// 					.add()
					// 					.id('<namespace>content').id('box').query({
					// 						id: '*',
					// 						selection: {
					// 							plan: [0, 30]
					// 						}
					// 					});
					//
					// 				produced = factory.resolve().observe();
					//
					// 				console.log(produced.getAtom(['<namespace>content', 'box']));
					// 			});
					//
					// 			it('bts', () => {
					// 				let size = 1;
					// 				let ingredient_model_description = factory.getAtom(['<namespace>builder', 'box']).model_decription;
					//
					// 				let data_model = {
					// 					type: {
					// 						type: {
					// 							deco: 'Box',
					// 							type: [ingredient_model_description]
					// 						},
					// 						deco: 'BaseCollection'
					// 					}
					// 				};
					//
					// 				let factory_provider = new FactoryDataProvider();
					//
					// 				let ingredient_provider = new IngredientDataProvider();
					// 				ingredient_provider
					// 					.setIngredient(['<namespace>content', 'plan'], 'plan', factory)
					// 					.setSize(size);
					//
					// 				factory_accessor = new BasicAccessor(factory_provider);
					// 				factory_accessor.keymaker('set', (p) => {
					// 						//@IDEA: add additional params here
					// 						return p;
					// 					})
					// 					.keymaker('get', (p) => p);
					//
					// 				let storage_accessor = new BasicAccessor(provider);
					// 				storage_accessor.keymaker('set', (p) => p.key)
					// 					.keymaker('get', (p) => {
					// 						let keys = p[box_id];
					//
					// 						if(keys == '*') {
					// 							//@NOTE: and?
					// 							//@NOTE: submit view key
					// 							//@IDEA: new View('view-name',params), parse view in DP
					// 							return _.reduce(TEST_STORAGE, (result, item, index) => {
					// 								if(~index.indexOf('box')) result.push(index);
					// 								return result;
					// 							}, []);
					// 						}
					//
					// 						if(_.isArray(keys)) return keys;
					//
					// 						return keys;
					// 					});
					//
					// 				factory_provider
					// 					.addIngredient(ingredient_provider)
					// 					.addStorage(storage_accessor);
					//
					//
					// 				let box_builder = AtomicFactory.create('Basic', {
					// 					type: data_model,
					// 					accessor: factory_accessor
					// 				});
					//
					// 				let box_storage = AtomicFactory.create('Basic', {
					// 					type: data_model,
					// 					accessor: storage_accessor
					// 				});
					//
					// 				booked_timeslot = new ResourceFactory();
					// 				booked_timeslot
					// 					.addAtom(box_builder, 'box', '<namespace>builder')
					// 					.addAtom(box_storage, 'box', '<namespace>content');
			});
		});
	})
})