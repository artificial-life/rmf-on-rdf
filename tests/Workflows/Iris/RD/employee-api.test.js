'use strict'
let RDFcb = require("cbird-rdf").RD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris');


describe('API: IRIS  Employee', () => {
	// describe.only('API: IRIS RD Employee', () => {
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
		let AgentApi = IrisWorkflow.AgentApi;
		iris = new AgentApi();
		iris.initContent();
		//@NOTE: building factory
		//@NOTE: prepare variables

	});


	describe('get/set employee', function() {
		this.timeout(10000);
		it('get/set emp', () => {

			return Promise.resolve(true)
				.then(() => {
					return iris.getEmployee({
						query: {
							first_name: "Иван"
						}
					});
				})
				.then((res) => {
					console.log("EMPLOYEE", require('util').inspect(res, {
						depth: null
					}));
					let iv = _.sample(res);
					iv.password_hash = iv.password_hash + '!';
					return iris.setEmployee(iv)
						.then((res) => {
							console.log("SET", res);
							return iris.getEmployee({
								keys: iv.id
							});
						})
				})
				.then((res) => {
					console.log("EMPLOYEE SET", require('util').inspect(res, {
						depth: null
					}));
					let iv = _.sample(res);
					return iris.setEmployeeField({
							query: iv
						}, {
							password_hash: iv.password_hash + '?'
						})
						.then((res) => {
							console.log("SET", res);
							return iris.getEmployee({
								keys: iv.id
							});
						})
				})
				.then((res) => {
					console.log("EMPLOYEE FIELD SET", require('util').inspect(res, {
						depth: null
					}));
					let iv = _.sample(_.keys(res));
					return iris.getEmployeeRoles(iv);
				})
				.then((res) => {
					console.log("EMPLOYEE ROLES", require('util').inspect(res, {
						depth: null
					}));

				})
		});
	})
})