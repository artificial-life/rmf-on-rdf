'use strict'

var _ = require('lodash');
var uuid = require('node-uuid');

var Content = require(_base + '/build/Classes/Content.js');
var ContentAsync = require(_base + '/build/Classes/ContentAsync.js');
var BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor.js');
var FactoryDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/FactoryDataProvider.js');
var IngredientDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/IngredientDataProvider.js');
var ResourceFactory = require(_base + '/build/Classes/ResourceFactory.js');
var AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');

let CouchbirdLinkedDataProvider = require(_base + '/build/externals/CouchbirdLinkedDataProvider.js');
let RDFcb = require("cbird-rdf").LD;
let LDCacheAccessor = require(_base + '/build/Classes/Atomic/Accessor/LDCacheAccessor');
let Couchbird = require("couchbird");

describe.only('Operators Collection : Cbird', () => {
	let vocab_basic = require(_base + "/tests/data/iris_basic.json");
	let vocab_domain = require(_base + "/tests/data/iris_domain.json");
	let test_data = require(_base + "/tests/data/data_expanded.json");
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
		prefix: {
			data: cfg.data_prefix,
			basic: cfg.vocabulary.basic,
			domain: cfg.vocabulary.domain
		},
		classes: {
			plan: {
				template: "schedule",
				map_keys: {
					"iris://vocabulary/domain#scheduleOf": "iris://vocabulary/domain#planOf"
				},
				map_values: {
					"iris://vocabulary/domain#hasTimeDescription": function(value) {
						let parsed = JSON.parse(value[0]['@value']);
						return {
							data: parsed,
							state: 'a'
						};
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

		let flatten_ld = function(data) {
			return _.pluck(_.flattenDeep(data), '@id');
		};

		let key_typecast = function(key, {
			type: type,
			prefix: prefix,
			id: id
		}) {
			let re = new RegExp("(.*)#([^-]*)-([^\/]*)");
			return key.replace(re, (str, oprefix, otype, oid) => {
				return `${(prefix|| oprefix)}#${(type|| otype)}-${(id || oid)}`;
			});
		}

		ops_plan_accessor.keymaker('get', function(p) {
			let day = "iris://vocabulary/domain#" + p.day;
			let op_keys = undefined;
			if(p.id == '*') {
				op_keys = {
					select: "iris://vocabulary/domain#member",
					where: {
						"@type": "iris://vocabulary/domain#Membership",
						"iris://vocabulary/domain#role": "iris://vocabulary/domain#Operator"
					},
					transform: flatten_ld
				};
			} else {
				op_keys = _.isArray(p.id) ? p.id : [p.id];
			}
			//return all plans/schedules that belong to persons with operators role
			let query = {
				type: 'view',
				key_depth: 1,
				query: {
					op_keys: op_keys,
					schedules: {
						select: "*",
						where: {
							"@type": "iris://vocabulary/domain#Schedule",
							'iris://vocabulary/domain#hasDay': day
						},
						test: function(data, query) {
							let res = flatten_ld(data["iris://vocabulary/domain#scheduleOf"])[0];
							return !!~_.indexOf(query.op_keys, res);
						}
					}
				},
				order: ['op_keys', 'schedules'],
				final: function(query) {
					let reduced = _.reduce(query.schedules, (acc, sch) => {
						let key = key_typecast(sch['@id'], {
							type: "plan"
						});
						let op = flatten_ld(sch["iris://vocabulary/domain#scheduleOf"])[0];
						acc[op] = acc[op] || [];
						acc[op].push(key);
						return acc;
					}, {});
					return reduced;
				}
			};

			return query;

		});

		services_accessor.keymaker('get', (query) => {
			let day = "iris://vocabulary/domain#" + query.selection.day;
			let op_keys = undefined;
			if(query.id == '*') {
				op_keys = {
					select: "iris://vocabulary/domain#member",
					where: {
						"@type": "iris://vocabulary/domain#Membership",
						"iris://vocabulary/domain#role": "iris://vocabulary/domain#Operator"
					},
					transform: flatten_ld
				};
			} else {
				op_keys = _.isArray(query.id) ? query.id : [query.id];
			}

			let service_keys = undefined;
			service_keys = {
				select: "*",
				where: {
					"@type": "iris://vocabulary/domain#Person"
				},
				test: function(data, query) {
					let res = data["@id"];
					return !!~_.indexOf(query.op_keys, res);
				},
				transform: function(data) {
					let keys = _.isArray(query.selection.id) ? query.selection.id : [query.selection.id];
					let check = [];
					let result = _.transform(data, (acc, item) => {
						let res = flatten_ld(item["iris://vocabulary/domain#provides"]);
						acc[item['@id']] = (query.selection.id == '*') ? res : _.intersection(res, keys);
						check = _.union(check, acc[item['@id']]);
						return acc;
					}, {});
					result.check_keys = check;
					return result;
				}
			};

			let req = {
				type: 'view',
				key_depth: 2,
				query: {
					op_keys: op_keys,
					service_keys: service_keys,
					schedules: {
						select: "*",
						where: {
							"@type": "iris://vocabulary/domain#Schedule",
							'iris://vocabulary/domain#hasDay': day
						},
						test: function(data, query) {
							let res = flatten_ld(data["iris://vocabulary/domain#scheduleOf"])[0];
							return !!~_.indexOf(query.service_keys.check_keys, res);
						}
					}
				},
				order: ['op_keys', 'service_keys', 'schedules'],
				final: function(query) {
					let grouped = _.groupBy(query.schedules, function(sch) {
						return flatten_ld(sch["iris://vocabulary/domain#scheduleOf"])[0];
					});
					delete query.service_keys.check_keys;
					let reduced = _.transform(query.service_keys, (res, s_ids, op_id) => {
						res[op_id] = _.reduce(s_ids, (acc, s_id) => {
							acc[s_id] = _.map(grouped[s_id], (val) => {
								return key_typecast(val['@id'], {
									type: 'plan'
								})
							});
							return acc;
						}, {});
					});
					// console.log("REDUCED", reduced);
					return reduced;
				}
			};
			return req;
		});
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
			deco: 'BaseCollectionAsync'
		};

		let plan_collection = AtomicFactory.create('BasicAsync', {
			type: datamodel,
			accessor: ops_plan_accessor
		});
		OPS.addAtom(plan_collection, 'plan');

		let attributes_services_datamodel = {
			type: {
				type: 'LDPlan',
				deco: 'BaseCollectionAsync'
			},
			deco: 'BaseCollectionAsync'
		};

		let operator_services_collection = AtomicFactory.create('BasicAsync', {
			type: attributes_services_datamodel,
			accessor: services_accessor
		});

		OPS.addAtom(operator_services_collection, 'services', '<namespace>attribute');
		console.log("OPS", OPS);

	});

	describe('test OPS', () => {
		it('observe all', () => {
			let services_query = {
				query: {
					id: '*',
					selection: {
						id: '*',
						day: 'Monday'
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
					console.log("RESOLVED", resolved_ops);
					let services = resolved_ops.getAtom(['<namespace>attribute', 'services']);
					// console.log("SERV", services);
					resolved_ops.selector().reset().add()
						// 	.id('<namespace>attribute').id('services').query({
						// 		id: '*',
						// 		selection: {
						// 			id: '*'
						// 		}
						// 	});
						// resolved_ops.selector().add()
						// 	.id('<namespace>content').id('plan').query({
						// 		id: '*'
						// 	});
					return services.observe({
						id: '*',
						selection: {
							id: '*'
						}
					});
				})
				.then((observed) => {
					console.log("OBSERVED", observed);
					console.log(require('util').inspect(observed.content["iris://data#human-2"].content, {
						depth: null
					}));

				})
				// .catch((err) => {
				// 	console.error("IT FAILED!", err);
				// })

		});
	});
});