'use strict'
let RDFcb = require("cbird-rdf").LD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris');
let gpc = require('generate-pincode');


describe('Workflow: IRIS Ticket', () => {
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
		let TicketApi = IrisWorkflow.TicketApi;
		iris = new TicketApi();
		iris.initContent();
		//@NOTE: building factory
		//@NOTE: prepare variables

	});


	describe('get/set ticket', function() {
		this.timeout(10000);
		it('get ticket', () => {
			return Promise.resolve(true)
				.then(() => {
					return iris.getTicket({
						query: {
							code: "3033291418",
							dedicated_date: "Mon, 21 Dec 2015 00:00:00 GMT"
						},
						options: {}
					}, {
						count: 5 // @NOTE not implemented
					})
				})
				.then((res) => {
					console.log("BYQ", require('util').inspect(res, {
						depth: null
					}));
					let tick = _.sample(res);
					console.log("TICKET CHOSEN", require('util').inspect(tick, {
						depth: null
					}));
					tick.state = 4;
					return iris.setTicket(tick);
				})
				.then((res) => {
					console.log("TICK SET", require('util').inspect(res, {
						depth: null
					}));
					return iris.getTicket({
						keys: ["iris://data#ticket-92f6d120-b268-11e5-9885-637e638a715a", "iris://data#ticket-d91b1280-b0fe-11e5-8f80-bdb52904e4c4"],
						options: {}
					}, {
						count: 5 // @NOTE not implemented
					})
				})
				.then((res) => {
					console.log("BYKEY", require('util').inspect(res, {
						depth: null
					}));

				});
		});
	})
})