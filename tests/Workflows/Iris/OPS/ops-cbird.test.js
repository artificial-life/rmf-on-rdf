'use strict'

var _ = require('lodash');
var uuid = require('node-uuid');

var Content = require(_base + '/build/Classes/Content.js');
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
	let OPS;
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
						let res = _.map(parsed, (chunk) => {
							return {
								data: chunk,
								state: 'a'
							};
						});
						return [{
							'@value': JSON.stringify(res)
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
			let query = [];
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
			query = {
				type: 'view',
				query: {
					op_keys: op_keys,
					schedules: {
						select: "*",
						where: {
							"@type": "iris://vocabulary/domain#Schedule"
						},
						test: function(data, query) {
							let res = flatten_ld(data["iris://vocabulary/domain#scheduleOf"])[0];
							return !!~_.indexOf(query.op_keys, res);
						}
					}
				},
				order: ['op_keys', 'schedules'],
				final: function(query) {
					return _.map(query.schedules, (sch) => {
						return key_typecast(sch['@id'], {
							type: "plan"
						});
					});
				}
			};

			return query;

		});

		services_accessor.keymaker('get', (query) => {
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
				select: "iris://vocabulary/domain#provides",
				where: {
					"@type": "iris://vocabulary/domain#Person"
				},
				test: function(data, query) {
					let res = data["@id"];
					return !!~_.indexOf(query.op_keys, res);
				},
				transform: function(data) {
					let res = flatten_ld(data);
					let keys = _.isArray(query.selection.id) ? query.selection.id : [query.selection.id];
					return(query.selection.id == '*') ? res : _.intersection(res, keys);
				}
			};

			let req = {
				type: 'view',
				query: {
					op_keys: op_keys,
					service_keys: service_keys,
					schedules: {
						select: "*",
						where: {
							"@type": "iris://vocabulary/domain#Schedule"
						},
						test: function(data, query) {
							let res = flatten_ld(data["iris://vocabulary/domain#scheduleOf"])[0];
							return !!~_.indexOf(query.service_keys, res);
						}
					}
				},
				order: ['op_keys', 'service_keys', 'schedules'],
				final: function(query) {
					return _.map(query.schedules, (sch) => {
						return key_typecast(sch['@id'], {
							type: "plan"
						});
					});
				}
			};
			return req;
		});
		// ops_plan_accessor.get({
		// 		query: {
		// 			// id: "*"
		// 			id: "iris://data#human-2"
		// 		},
		// 		options: {}
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
		// 		options: {}
		// 	})
		// 	.then((res) => {
		// 		console.log("OUCH", require('util').inspect(res, {
		// 			depth: null
		// 		}));
		// 	})

		OPS = new Content();

		let datamodel = {
			type: 'LDPlan',
			deco: 'BaseCollection'
		};

		let plan_collection = AtomicFactory.create('Basic', {
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

		let operator_services_collection = AtomicFactory.create('Basic', {
			type: attributes_services_datamodel,
			accessor: services_accessor
		});

		OPS.addAtom(operator_services_collection, 'services', '<namespace>attribute');
	});

	describe('test OPS', () => {
		it('observe all', () => {
			OPS.selector().reset().add()
				.id('<namespace>content').id('plan').query({
					query: {
						id: '*'
					},
					options: {}
				});

			OPS.selector().add()
				.id('<namespace>attribute').id('services').query({
					query: {
						id: '*',
						selection: {
							id: '*'
						}
					},
					options: {}
				});

			let resolved_ops = OPS.resolve();
			//
			// 		let services = resolved_ops.getAtom(['<namespace>attribute', 'services']);
			// 		let observed = services.observe({
			// 			id: 'operator1_services',
			// 			selection: {
			// 				id: '*'
			// 			}
			// 		});
			//
			// 		_.forEach(observed.content.operator1_services.content, (item, name) => {
			// 			console.log(name, item)
			// 		});
		});
	});
});