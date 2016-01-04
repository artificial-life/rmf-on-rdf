'use strict'
let RDFcb = require("cbird-rdf").LD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris/IrisWorkflow.js');
let gpc = require('generate-pincode');


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
		bucket.removeNodes("iris://data#plan-2--2015-12-21");

		iris = new IrisWorkflow();
		iris.init(cfg.buckets.main);
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
								operator: '*',
								dedicated_date: 'Mon, 21 Dec 2015 00:00:00 GMT', //UTC string or any object valid for new Date(obj)
								service: 'iris://data#service-2',
								time_description: [40000000, 60000000]
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
						let rp = box['ldplan'].resolve_params;
						rp.code = gpc(10).toString();
						rp.label = "P84";
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
					return iris.getUserInfo({
						query: {
							first_name: "Ivaniy"
						}
					})
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
					// return iris.setUserInfo({
					// 	query: {
					// 		first_name: "Ivaniy",
					// 		second_name: "Cocainum",
					// 		middle_name: "Mihalych",
					// 		phone: 1234654897
					// 	}
					// })
				});
		});
	})
})