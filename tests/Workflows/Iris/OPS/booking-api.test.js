'use strict'
let RDFcb = require("cbird-rdf").LD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris');
let gpc = require('generate-pincode');
let uuid = require('node-uuid');

// describe.only('Workflow: IRIS Booking', () => {
describe('Workflow: IRIS Booking', () => {
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
	let tickets = null;
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
		let TicketApi = IrisWorkflow.TicketApi;
		iris = new BookingApi();
		tickets = new TicketApi();
		iris.initContent();
		tickets.initContent();
		//@NOTE: building factory
		//@NOTE: prepare variables

	});


	describe('basic observe-reserve', function() {
		this.timeout(10000);
		it('build concrete', () => {
			let data;
			return Promise.resolve(true)
				.then(() => {
					return iris.observe({
						dedicated_date: 'Mon, 21 Dec 2015 00:00:00 GMT', //UTC string or any object valid for new Date(obj)
						services: [{
							service: "iris://data#service-2",
							time_description: 1000 // or whatever it is default
						}, {
							service: "iris://data#service-1",
							time_description: 500 // or whatever it is default
						}],
						time_description: [40000, 68400] //from now till the day ends or something
					}, {
						count: 1 //how many tickets per service you want
							// not here
							// size: 30 * 3600
					});
				})
				.then((produced) => {
					console.log("OBSERVED", require('util').inspect(produced, {
						depth: null
					}));
					data = _.reduce(produced, (acc, tick, box_id) => {
						let rp = tick;
						rp.id = 'ticket-' + uuid.v1();
						rp.code = gpc(10).toString();
						rp.label = "P84";
						rp.user_info = "none"
						rp.destination = "none"
						rp.service_count = 1;
						rp.priority = 0;
						rp.state = 'registered';
						rp.booking_date = (new Date()).toUTCString();
						acc[box_id] = rp;
						return acc;
					}, {});
					data.dedicated_date = 'Mon, 21 Dec 2015 00:00:00 GMT';
					data.time_description = [40000, 68400];
					return iris.confirm(data);
				})
				.then((saved) => {
					console.log("SAVED", require('util').inspect(saved, {
						depth: null
					}));
					let to_call = _.reduce(saved.placed, (acc, tick, box_id) => {
						let rp = {
							id: _.last(box_id.split("#"))
						};
						rp.destination = "iris://data#pc-1";
						rp.operator = "iris://data#human-1"
						rp.state = 'called';
						rp.time_description = [55000, 55666];
						acc[box_id] = rp;
						return acc;
					}, {});
					to_call.dedicated_date = 'Mon, 21 Dec 2015 00:00:00 GMT';
					to_call.time_description = [40000, 68400];
					console.log("TO_CALL", require('util').inspect(to_call, {
						depth: null
					}));
					return iris.reserve(to_call);
				})
				.then((saved) => {
					console.log("CALLED", require('util').inspect(saved, {
						depth: null
					}));
					let to_close = _.keys(saved.placed)[0];
					return tickets.getTicket({
							keys: [to_close]
						})
						.then((res) => {
							let tick = _.values(res)[0];
							tick.time_description[1] += 400;
							tick.state = 'closed';
							let tick_close = {
								dedicated_date: tick.dedicated_date,
								time_description: [40000, 68400]
							};
							tick_close[tick.id] = tick;
							console.log("TO_CLOSE", require('util').inspect(tick_close, {
								depth: null
							}));
							return iris.reserve(tick_close);
						});
				})
				.then((saved) => {
					console.log("CLOSED", require('util').inspect(saved, {
						depth: null
					}));
				})
		});
	})
})