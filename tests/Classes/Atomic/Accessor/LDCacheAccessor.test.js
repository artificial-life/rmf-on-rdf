'use strict'

let LDCacheAccessor = require('./LDCacheAccessor');
let CouchbirdLinkedDataProvider = require(_base + '/build/externals/CouchbirdLinkedDataProvider');
let RDFcb = require("cbird-rdf").LD;

describe.only("LDCacheAccessor", () => {
	let vocab_basic = require(_base + "/tests/data/iris_basic.json");
	let vocab_domain = require(_base + "/tests/data/iris_domain.json");
	let cfg = {
		"couchbird": {
			"server_ip": "127.0.0.1",
			"n1ql": "127.0.0.1:8093"
		},
		"bucket": "rdf",
		"vocabulary": {
			"basic": "iris://vocabulary/basic",
			"domain": "iris://vocabulary/domain",
			"fs": false
		},
		"data_prefix": "iris://data"
	};
	let classmap = {
		prefix: cfg.data_prefix,
		classes: {
			plan: {
				template: "schedule",
				main: "plan"
			}
		}
	};
	let db = null;
	let bucket = null;
	let dp = null;
	let accessor = null;

	before(() => {
		db = new RDFcb(cfg.couchbird);
		bucket = db.bucket(cfg.bucket);
		bucket.upsert("iris://vocabulary/basic", vocab_basic);
		bucket.upsert("iris://vocabulary/domain", vocab_domain);
		//not necessary yet
		//bucket.installViews();
		bucket.setVocabulary(cfg.vocabulary);
		dp = new CouchbirdLinkedDataProvider(bucket);
	});

	beforeEach(() => {
		accessor = new LDCacheAccessor(dp);
	});

	describe('#constructor', () => {
		it('should be constructed', () => {
			expect(accessor).to.be.an.instanceof(LDCacheAccessor);
			expect(accessor).to.have.deep.property('makers.set').which.is.an.instanceof(Function);
			expect(accessor).to.have.deep.property('makers.get').which.is.an.instanceof(Function);
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
	});
});