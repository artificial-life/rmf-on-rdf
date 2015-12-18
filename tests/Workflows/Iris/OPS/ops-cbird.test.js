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
					"iris://vocabulary/domain#scheduleDescription": "iris://vocabulary/domain#planDescription",
					"iris://vocabulary/domain#scheduleOf": "iris://vocabulary/domain#planOf"
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
		accessor = new LDCacheAccessor(dp);
		accessor.mapper(classmap);
		accessor.template();
	});

	beforeEach(() => {
		let ops_plan_accessor = accessor; //= new BasicAccessor(dp);
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
			if(p.id == '*') {
				//return all plans/schedules that belong to persons with operators role
				query = {
					type: 'view',
					query: {
						op_keys: {
							select: "iris://vocabulary/domain#member",
							where: {
								"@type": "iris://vocabulary/domain#Membership",
								"iris://vocabulary/domain#role": "iris://vocabulary/domain#Operator"
							},
							transform: flatten_ld
						},
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
			} else {
				let ids = _.isArray(p.id) ? p.id : [p.id];
				query = {
					query: {
						schedules: {
							select: "*",
							where: {
								"@type": "iris://vocabulary/domain#Schedule"
							},
							test: function(data, query) {
								let res = flatten_ld(data["iris://vocabulary/domain#scheduleOf"])[0];
								return !!~_.indexOf(ids, res);
							}
						}
					},
					final: function(query) {
						return _.map(query.schedules, (sch) => {
							return key_typecast(sch['@id'], {
								type: "plan"
							});
						});
					}
				};
			}
			return query;

		});

		OPS = new Content();

		let datamodel = {
			type: 'Plan',
			deco: 'BaseCollection'
		};

		let plan_collection = AtomicFactory.create('Basic', {
			type: datamodel,
			accessor: ops_plan_accessor
		});

		// OPS.addAtom(plan_collection, 'plan');
		//
		// let attributes_services_datamodel = {
		// 	type: {
		// 		type: 'Plan',
		// 		deco: 'BaseCollection'
		// 	},
		// 	deco: 'BaseCollection'
		// };
		//
		// let services_accesor = new BasicAccessor(provider);
		// services_accesor.keymaker('get', (query) => {
		// 	let operator_id = query.id;
		// 	let service_id = query.selection.id;
		//
		// 	if(operator_id == '*') {
		// 		return ['operator1_services', 'operator2_services', 'operator3_services'];
		// 	}
		// });
		//
		// let operator_services_collection = AtomicFactory.create('Basic', {
		// 	type: attributes_services_datamodel,
		// 	accessor: services_accesor
		// });
		//
		// OPS.addAtom(operator_services_collection, 'services', '<namespace>attribute');
	});

	describe('tst', () => {
			it('rages', () => {
				expect(true);
			})
		})
		// describe('test OPS', () => {
		// 	it('observe all', () => {
		// 		OPS.selector().reset().add()
		// 			.id('<namespace>content').id('plan').query({
		// 				id: '*'
		// 			});
		//
		// 		OPS.selector().add()
		// 			.id('<namespace>attribute').id('services').query({
		// 				id: '*',
		// 				selection: {
		// 					id: '*'
		// 				}
		// 			});
		//
		// 		let resolved_ops = OPS.resolve();
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
		// 	});
		// });
});