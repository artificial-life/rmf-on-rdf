'use strict'
let RDFcb = require("cbird-rdf").LD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris');
let gpc = require('generate-pincode');


describe('Workflow: IRIS Service', () => {
	// describe.only('Workflow: IRIS Service', () => {
	let vocab_basic = require(_base + "/tests/data/iris_basic.json");
	let vocab_domain = require(_base + "/tests/data/iris_domain.json");
	let test_data = require(_base + "/tests/data/data_expanded.json");
	let keymakers = require(_base + "/build/Workflows/Iris/keymakers");
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


	let iris = null;
	let db = null;
	let bucket = null;

	before(() => {
		db = new RDFcb(cfg.couchbird);
		bucket = db.bucket(cfg.buckets.main);
		bucket.upsert("iris://vocabulary/basic", vocab_basic);
		bucket.upsert("iris://vocabulary/domain", vocab_domain);
		bucket.N1QL(Couchbird.N1qlQuery.fromString("CREATE PRIMARY INDEX ON " + cfg.buckets.main + ";"))
		bucket.installViews();
		// bucket.setVocabulary(cfg.vocabulary);
		bucket.upsertNodes(test_data);

		IrisWorkflow.initializer(cfg.buckets.main);
		let ServiceApi = IrisWorkflow.ServiceApi;
		iris = new ServiceApi();
		iris.initContent();
		//@NOTE: building factory
		//@NOTE: prepare variables

	});


	describe('get services', function() {
		this.timeout(10000);
		it('get service group', (done) => {
			return Promise.resolve(true)
				.then(() => {
					return iris.getServiceGroup({
						query: {
							name: "root"
						},
						options: {}
					})
				})
				.then((res) => {
					console.log("BY name", require('util').inspect(res, {
						depth: null
					}));
					let s_keys = _.sample(res).service_group_content;
					return iris.getService({
						keys: s_keys,
						options: {}
					});
				})
				.then((res) => {
					console.log("PICKED", require('util').inspect(res, {
						depth: null
					}));
					return iris.getServiceTree({
						keys: ["sg-1", "sg-3"],
						options: {}
					})
				})
				.then((res) => {
					console.log("SERVICE TREE", require('util').inspect(res, {
						depth: null
					}));
					done();
				});
		});

		it('set Service', (done) => {
			return Promise.resolve(true)
				.then((res) => {
					return iris.getEntry(false, {
						keys: "iris://data#service-1",
						options: {}
					})
				})
				.then((res) => {
					console.log("BYKEY", require('util').inspect(res, {
						depth: null
					}));
					let wp = _.sample(res);
					return iris.setServiceField({
						query: wp
					}, {
						priority: 5
					})
				})
				.then((res) => {
					console.log("SVC SAVED", require('util').inspect(res, {
						depth: null
					}));
					return iris.getService({
						query: {
							priority: 5
						},
						options: {}
					});
				})
				.then((res) => {
					console.log("CHANGEDD PRIORITY", require('util').inspect(res, {
						depth: null
					}));
					done();
				})
		});
	})
})