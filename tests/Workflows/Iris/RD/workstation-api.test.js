'use strict'
let RDFcb = require("cbird-rdf").RD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris');
let gpc = require('generate-pincode');


// describe('Workflow: IRIS Workstation', () => {
describe.only('Workflow: IRIS Workstation', () => {
	let test_data = require(_base + "/tests/data/data_expanded_parsed.json");
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
		}
	};


	let iris = null;
	let db = null;
	let bucket = null;

	before(() => {
		db = new RDFcb(cfg.couchbird);
		bucket = db.bucket(cfg.buckets.main);
		bucket.N1QL(Couchbird.N1qlQuery.fromString("CREATE PRIMARY INDEX ON " + cfg.buckets.main + ";"))
		bucket.upsertNodes(test_data);
		bucket.removeNodes("plan-1--2015-12-21");
		bucket.removeNodes("plan-2--2015-12-21");

		IrisWorkflow.initializer(cfg.buckets.main);
		let WorkstationApi = IrisWorkflow.WorkstationApi;
		iris = new WorkstationApi();
		iris.initContent();
		//@NOTE: building factory
		//@NOTE: prepare variables

	});


	describe('get/set wp', function() {
		this.timeout(10000);
		it('get Workstation', () => {
			return Promise.resolve(true)
				.then(() => {
					return iris.getWorkstation({
						query: {
							default_agent: "human-1"
						},
						options: {}
					})
				})
				.then((res) => {
					console.log("BY DEFAULT OP", require('util').inspect(res, {
						depth: null
					}));

					return iris.getWorkstation({
						query: {
							occupied_by: "human-1"
						},
						options: {}
					});
				})
				.then((res) => {
					console.log("OCCUPIED BY OP", require('util').inspect(res, {
						depth: null
					}));
					return iris.getWorkstation({
						query: {
							short_label: "2"
						},
						options: {}
					})
				})
				.then((res) => {
					console.log("BY ROLE", require('util').inspect(res, {
						depth: null
					}));
					return iris.getWorkstation({
						keys: "pc-1",
						options: {}
					})
				})
				.then((res) => {
					console.log("BYKEY", require('util').inspect(res, {
						depth: null
					}));

				});
		});

		it('set Workstation', () => {
			return Promise.resolve(true)
				.then((res) => {
					return iris.getWorkstation({
						keys: "pc-1",
						options: {}
					})
				})
				.then((res) => {
					console.log("BYKEY", require('util').inspect(res, {
						depth: null
					}));
					let wp = _.sample(res);
					delete wp.allows_role;
					return iris.setWorkstationField({
						query: wp
					}, {
						occupied_by: "human-1"
					}, true)
				})
				.then((res) => {
					console.log("DEVICE SAVED", require('util').inspect(res, {
						depth: null
					}));
					return iris.getWorkstation({
						query: {
							occupied_by: "human-1"
						},
						options: {}
					});
				})
				.then((res) => {
					console.log("OCC 1", require('util').inspect(res, {
						depth: null
					}));
					let wp = _.sample(res);
					delete wp.allows_role;
					return iris.setWorkstationField({
						query: wp
					}, {
						occupied_by: "human-2"
					}, true)
				})
				.then((res) => {
					console.log("DEVICE SAVED", require('util').inspect(res, {
						depth: null
					}));
					return iris.getWorkstation({
						query: {
							occupied_by: "human-2"
						},
						options: {}
					});
				})
				.then((res) => {
					console.log("OCCUPIED", require('util').inspect(res, {
						depth: null
					}));
				})
		});
	})
})