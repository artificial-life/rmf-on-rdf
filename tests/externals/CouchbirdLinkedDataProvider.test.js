'use strict'

let CouchbirdLinkedDataProvider = require('./CouchbirdLinkedDataProvider.js');
let RDFcb = require("cbird-rdf").LD;

describe('CouchbirdLinkedDataProvider', () => {
	let vocab_basic = require(_base + "/tests/data/iris_basic.json");
	let vocab_domain = require(_base + "/tests/data/iris_domain.json");
	let test_data = require(_base + "/tests/data/data_expanded.json");
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
		}
	};
	let db = null;
	let bucket = null;
	let dp = null;

	let rabbit = {
		"@id": "http://wonderland#whiterabbit",
		"@type": ["http://wonderland#Rabbit"],
		'http://wonderland#color': [{
			"@id": "http://wonderland#white"
		}]
	};
	let another_rabbit = {
		"@id": "http://wonderland#whiterabbit",
		"@type": ["http://wonderland#Rabbit"],
		'http://wonderland#color': [{
			"@id": "http://wonderland#almostwhite"
		}]
	};
	let nonex = {
		"@id": "http://whatever#itis0",
		"@type": "http://whatever#itis"
	};

	before(() => {
		db = new RDFcb(cfg.couchbird);
		bucket = db.bucket(cfg.buckets.main);
		bucket.upsert("iris://vocabulary/basic", vocab_basic);
		bucket.upsert("iris://vocabulary/domain", vocab_domain);
		//not necessary yet
		//bucket.installViews();
		bucket.setVocabulary(cfg.vocabulary);
		bucket.upsertNodes(rabbit);
		bucket.removeNodes(nonex["@id"]);
		dp = new CouchbirdLinkedDataProvider(bucket);
	});

	describe('#constructor', () => {
		it('should have injected bucket', () => {
			expect(dp).to.be.an.instanceof(CouchbirdLinkedDataProvider);
			expect(dp).to.have.property("_bucket").which.is.eql(bucket);
		});
	});

	describe('methods', () => {
		describe('#get', () => {
			it('should get existing', (done) => {
				var result = dp.get(rabbit["@id"])
					.then((res) => {
						expect(res).to.have.deep.property(`${rabbit["@id"]}.value`).which.is.eql(rabbit);
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
			it('should return undefined on non-existent', (done) => {
				var result = dp.get(nonex["@id"])
					.then((res) => {
						expect(res).to.have.property(nonex["@id"]).which.is.undefined;
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
		});

		describe('#set', () => {
			it('should set existing', (done) => {
				var result = dp.set(another_rabbit)
					.then((res) => {
						expect(res).to.have.deep.property(`${rabbit["@id"]}.cas`).which.is.string;
						return dp.get(rabbit["@id"]);
					})
					.then((res) => {
						expect(res).to.have.deep.property(`${rabbit["@id"]}.value`).which.is.eql(another_rabbit);
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

			it('should return false on non-existent', (done) => {
				var result = dp.set(nonex)
					.then((res) => {
						expect(res).to.have.property(nonex["@id"]).which.is.false;
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
		});

		describe('#upsert', () => {
			it('should upsert anything', (done) => {
				var result = dp.upsert(rabbit)
					.then((res) => {
						expect(res).to.have.deep.property(`${rabbit["@id"]}.cas`).which.is.string;
						return dp.get(rabbit["@id"]);
					})
					.then((res) => {
						expect(res).to.have.deep.property(`${rabbit["@id"]}.value`).which.is.eql(rabbit);
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

		});
		describe('#remove', () => {
			it('should remove existing', (done) => {
				var result = dp.remove(rabbit["@id"])
					.then((res) => {
						expect(res).to.have.deep.property(`${rabbit["@id"]}.cas`).which.is.string;
						return dp.get(rabbit["@id"]);
					})
					.then((res) => {
						expect(res).to.have.property(rabbit["@id"]).which.is.undefined;
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
			it('should return false on non-existent', (done) => {
				var result = dp.remove(nonex["@id"])
					.then((res) => {
						expect(res).to.have.property(nonex["@id"]).which.is.false;
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
		});
	});
});