'use strict'

let LDCacheAccessor = require('./LDCacheAccessor');
let CouchbirdLinkedDataProvider = require(_base + '/build/externals/CouchbirdLinkedDataProvider');
let RDFcb = require("cbird-rdf").LD;

let HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
let TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

//the most complex example of Schedule/Plan handling
//data model probably will be simplified later
describe("LDCacheAccessor", () => {
	let vocab_basic = require(_base + "/tests/data/iris_basic.json");
	let vocab_domain = require(_base + "/tests/data/iris_domain.json");
	let cfg = {
		"couchbird": {
			"server_ip": "127.0.0.1",
			"n1ql": "127.0.0.1:8093"
		},
		"buckets": {
			"main": "rdf"
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

	let test_sch = {
		"@id": "iris://data#schedule-123",
		"@type": [
			"iris://vocabulary/domain#Schedule"
		],
		"iris://vocabulary/domain#hasTimeDescription": [{
			"@value": "[[32400000, 46800000], [50400000, 64800000]]"
		}],
		"iris://vocabulary/domain#scheduleOf": [{
			"@id": "iris://data#human-3"
		}]
	};

	let test_plan = {
		"@id": "iris://data#plan-123",
		"@type": [
			"iris://vocabulary/domain#Plan"
		],
		"iris://vocabulary/domain#hasTimeDescription": [{
			"@value": "[{\"data\":[32400000,46800000],\"state\":\"a\"},{\"data\":[50400000,64800000],\"state\":\"a\"}]"
		}],
		"iris://vocabulary/domain#planOf": [{
			"@id": "iris://data#human-1"
		}]
	};

	before(() => {
		db = new RDFcb(cfg.couchbird);
		bucket = db.bucket(cfg.buckets.main);
		bucket.upsert("iris://vocabulary/basic", vocab_basic);
		bucket.upsert("iris://vocabulary/domain", vocab_domain);
		//not necessary yet
		bucket.installViews();
		bucket.setVocabulary(cfg.vocabulary);
		dp = new CouchbirdLinkedDataProvider(bucket);
		bucket.upsertNodes(test_sch);
		// dp = new HashmapDataProvider(); //temporary
		// TEST_STORAGE[test_sch["@id"]] = test_sch;
		accessor = new LDCacheAccessor(dp);
	});

	beforeEach(() => {
		// accessor.template();
	});

	describe('#constructor', () => {
		it('should be constructed', () => {
			expect(accessor).to.be.an.instanceof(LDCacheAccessor);
		});
	});

	describe('methods', () => {

		describe('#mapper', () => {
			it('should set a classmap', () => {
				accessor.mapper(classmap);
				expect(accessor).to.have.property('class_map').which.is.eql(classmap);
				expect(accessor).to.have.property('template').which.is.an.instanceof(Function);
			});
		});
		describe('#template', () => {
			it('should set default template function', () => {
				accessor.template();
				expect(accessor).to.have.property('template_maker').which.is.an.instanceof(Function);
			});
			it('should set template function', () => {
				accessor.template(() => 'test');
				expect(accessor).to.have.property('template_maker').which.is.an.instanceof(Function);
				expect(accessor.template_maker()).to.equal('test');
			});
		});
		describe('#get', () => {
			it('should not retrieve anything', (done) => {
				accessor.keymaker('get', (x) => x);
				accessor.mapper(classmap);
				accessor.template();
				let result = accessor.get({
						keys: 'magic'
					})
					.then((res) => {
						expect(res.magic).to.be.undefined;
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
			it('should retrieve original doc', (done) => {
				accessor.keymaker('get', (x) => x);
				accessor.mapper(classmap);
				accessor.template();
				let result = accessor.get({
						keys: test_sch["@id"]
					})
					.then((res) => {
						expect(res[test_sch["@id"]]['value']).to.eql(test_sch);
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
			it('should retrieve templated doc', (done) => {
				accessor.keymaker('get', (x) => x);
				accessor.mapper(classmap);
				accessor.template();
				let result = accessor.get({
						keys: cfg.data_prefix + "#plan-123"
					})
					.then((res) => {
						expect(res[cfg.data_prefix + "#plan-123"]).to.eql(test_plan);
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

		});

	});
});