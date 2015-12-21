'use strict'

var ContentAsync = require(_base + '/build/Classes/ContentAsync.js');
var AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');

let CouchbirdLinkedDataProvider = require(_base + '/build/externals/CouchbirdLinkedDataProvider.js');
let RDFcb = require("cbird-rdf").LD;
let LDCacheAccessor = require(_base + '/build/Classes/Atomic/Accessor/LDCacheAccessor');
let Couchbird = require("couchbird");

describe('Operators Collection : Cbird', () => {
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
	let OPS = null;
	let RESOLVED = null;
	let OBSERVED = null;

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
	});

	beforeEach(() => {
		let ops_plan_accessor = new LDCacheAccessor(dp);
		ops_plan_accessor.mapper(classmap);
		let services_accessor = new LDCacheAccessor(dp);
		services_accessor.mapper(classmap);

		ops_plan_accessor.keymaker('get', keymakers.op_plan.get);
		services_accessor.keymaker('get', keymakers.op_service_plan.get);
		// ops_plan_accessor.get({
		// 		query: {
		// 			// id: "*"
		// 			id: "iris://data#human-2"
		// 		},
		// 		options: {},
		// 		depth: 1
		// 	})
		// 	.then((res) => {
		// 		console.log("OUCH", require('util').inspect(res, {
		// 			depth: null
		// 		}));
		// 	})
		//
		// services_accessor.get({
		// 		query: {
		// 			id: "*",
		// 			// id: "iris://data#human-2",
		// 			selection: {
		// 				// id: "*"
		// 				id: "iris://data#service-1"
		// 			}
		// 		},
		// 		options: {},
		// 		depth: 2
		// 	})
		// 	.then((res) => {
		// 		console.log("OUCH", require('util').inspect(res, {
		// 			depth: null
		// 		}));
		// 	})

		OPS = new ContentAsync();

		let datamodel = {
			type: 'LDPlan',
			deco: 'BaseCollection'
		};

		let plan_collection = AtomicFactory.create('BasicAsync', {
			type: datamodel,
			accessor: ops_plan_accessor
		});
		OPS.addAtom(plan_collection, 'plan');

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

		OPS.addAtom(operator_services_collection, 'services', '<namespace>attribute');
	});

	describe('test OPS', function() {
		this.timeout(5000);
		it('observe', (done) => {
			let services_query = {
				query: {
					id: '*',
					day: 'Monday',
					selection: {
						id: '*',
					}
				},
				options: {}
			};

			let ops_query = {
				query: {
					id: '*',
					day: 'Monday'
				},
				options: {}
			};

			OPS.selector().reset().add()
				.id('<namespace>content').id('plan').query(ops_query);

			OPS.selector().add()
				.id('<namespace>attribute').id('services').query(services_query);

			Promise.resolve(true)
				.then(() => {
					return OPS.resolve();
				})
				.then((resolved_ops) => {
					// console.log("RESOLVED", resolved_ops);
					let services = resolved_ops.getAtom(['<namespace>attribute', 'services']);

					return services.observe({
						id: '*',
						selection: {
							id: '*'
						}
					});

				})
				.then((observed) => {
					// console.log("OBSERVED", observed);
					// console.log(require('util').inspect(observed.content["iris://data#human-2"].content, {
					// 	depth: null
					// }));
					done();

				})
				// .catch((err) => {
				// 	console.error("IT FAILED!", err);
				// })

		});
	});
});