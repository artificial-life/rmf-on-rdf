'use strict'
let RDFcb = require("cbird-rdf").LD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris/IrisWorkflow.js');


describe.only('Workflow: IRIS ', () => {
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

		iris = new IrisWorkflow();
		iris.init(cfg);
		//@NOTE: building factory
		//@NOTE: prepare variables

	});


	describe('basic observe-reserve', function() {
		this.timeout(10000);
		it('build concrete', () => {

			return Promise.resolve(true)
				.then(() => {
					return iris.observe({
						selection: {
							ldplan: {
								operator_id: '*',
								date: 'Mon, 21 Dec 2015 00:00:00 GMT', //UTC string or any object valid for new Date(obj)
								selection: {
									service_id: 'iris://data#service-2',
									selection: [40000000, 60000000]
								}
							}
						},
						box_id: 2
					}, {
						count: 6,
						size: 30 * 3600
					});
				})
				.then((produced) => {
					console.log("OBSERVED", require('util').inspect(produced, {
						depth: null
					}));
					let data = _.reduce(produced, (acc, box, box_id) => {
						console.log("AAA", box, box_id);
						let rp = box['ldplan'].resolve_params;
						rp.code = "456789";
						rp.label = "P54";
						rp.user_info = "none"
						rp.destination = "none"
						rp.service_count = 1;
						rp.priority = 1;
						rp.state = 0;
						rp.booking_date = (new Date()).toUTCString();
						acc[box_id] = box;
						acc[box_id]['ldplan'].resolve_params = rp;
						return acc;
					}, {});
					// console.log("DATA", require('util').inspect(data, {
					// 	depth: null
					// }));
					// return produced.save();
					// console.log("RESERVED", require('util').inspect(iris.produced.content_map, {
					// 	depth: null
					// }));
					return iris.reserve(data);
				})
				.then((saved) => {
					console.log("SAVED", require('util').inspect(saved, {
						depth: null
					}));

					return iris.getTicketsData({
						query: {
							id: '*',
							service: "iris://data#service-2",
							state: 0,
							priority: 1,
							label: "P54"
						},
						options: {}
					}, {
						count: 5
					})
				})
				.then((res) => {
					console.log("BOXES", require('util').inspect(res, {
						depth: null
					}));
				});
		});
	})
})