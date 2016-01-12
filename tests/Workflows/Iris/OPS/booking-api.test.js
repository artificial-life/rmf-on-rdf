'use strict'
let RDFcb = require("cbird-rdf").LD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris');
let gpc = require('generate-pincode');


describe.only('Workflow: IRIS Booking', () => {
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
					return iris.observe({
						dedicated_date: 'Mon, 21 Dec 2015 00:00:00 GMT', //UTC string or any object valid for new Date(obj)
						services: [{
							service: "iris://data#service-2",
							time_description: 1000000 // or whatever it is default
						}, {
							service: "iris://data#service-1",
							time_description: 500000 // or whatever it is default
						}],
						time_description: [40000000, 60000000] //from now till the day ends or something
					}, {
						count: 2 //how many tickets per service you want
							// not here
							// size: 30 * 3600
					});
				})
				.then((produced) => {
					console.log("OBSERVED", require('util').inspect(produced, {
						depth: null
					}));
					let data = _.reduce(produced, (acc, tick, box_id) => {
						let rp = tick;
						rp.code = gpc(10).toString();
						rp.label = "P84";
						rp.user_info = "none"
						rp.destination = "none"
						rp.service_count = 1;
						rp.priority = 0;
						rp.state = 0;
						rp.booking_date = (new Date()).toUTCString();
						acc[box_id] = rp;
						return acc;
					}, {});
					return iris.reserve(data);
				})
				// 	.then((saved) => {
				// 		console.log("SAVED", require('util').inspect(saved, {
				// 			depth: null
				// 		}));
				// 	})
		});
	})
})