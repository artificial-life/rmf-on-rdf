'use strict'
let RDFcb = require("cbird-rdf").LD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris');
let gpc = require('generate-pincode');


describe('Workflow: IRIS Booking UserInfo', () => {
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
		bucket.removeNodes("iris://data#plan-1--2015-12-21");
		bucket.removeNodes("iris://data#plan-2--2015-12-21");

		IrisWorkflow.initializer(cfg.buckets.main);
		let BookingApi = IrisWorkflow.BookingApi;
		iris = new BookingApi();
		iris.initContent();
		//@NOTE: building factory
		//@NOTE: prepare variables

	});


	describe('basic observe-reserve', function() {
		this.timeout(10000);
		it('build concrete', () => {

			return Promise.resolve(true)
				.then(() => {
					return iris.getUserInfo({
						query: {
							first_name: "Ivaniy"
						}
					});
				})
				.then((res) => {
					console.log("USERINFO", require('util').inspect(res, {
						depth: null
					}));
					let iv = _.sample(res);
					return iris.setUserInfo({
						id: iv.id,
						first_name: iv.first_name,
						last_name: "Cocainum",
						middle_name: "Mihalych",
						phone: 1234654897
					})
				})
				.then((res) => {
					console.log("USERINFO SET", require('util').inspect(res, {
						depth: null
					}));

				})
		});
	})
})