'use strict'

let keymakers = require("./keymakers");
let classmap = require("./classmap");
let base_dir = "../../../";

//Model
let TypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/Employee');
let MembershipTypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/Membership');
let DecoModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/LDEntity');

//Atomics
let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');
//DP
let CouchbirdLinkedDataProvider = require(base_dir + '/build/externals/CouchbirdLinkedDataProvider');
//accessor
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor');
//parent
let IrisApi = require("./IrisApi");

class AgentApi extends IrisApi {
	constructor() {
		super();
	}


	initContent() {
		let dp = new CouchbirdLinkedDataProvider(this.db);
		let translator = (prop) => {
			return "iris://vocabulary/domain#" + _.camelCase(prop);
		};
		let Model = DecoModel.bind(DecoModel, TypeModel, translator);
		let storage_data_model = {
			type: {
				type: 'Employee',
				deco: 'LDEntity',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'employee_id'
		};


		let storage_accessor = new LDAccessor(dp);

		storage_accessor
			.keymaker('set', keymakers('generic_ld')(Model, 'employee').set)
			.keymaker('get', keymakers('generic_ld')(Model, 'employee').get);


		let storage = AtomicFactory.create('BasicAsync', {
			type: storage_data_model,
			accessor: storage_accessor
		});
		//@NOTE: actually not content, but atomic
		this.content = storage;

		this.initMembershipContent();

		return this;
	}

	initMembershipContent() {
		let dp = new CouchbirdLinkedDataProvider(this.db);
		let storage_accessor = new LDAccessor(dp);
		let translator = (prop) => {
			return "iris://vocabulary/domain#" + _.camelCase(prop);
		};
		let Model = DecoModel.bind(DecoModel, MembershipTypeModel, translator);
		let storage_data_model = {
			type: {
				type: 'Membership',
				deco: 'LDEntity',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'membership_id'
		};

		storage_accessor
			.keymaker('set', keymakers('generic_ld')(Model).set)
			.keymaker('get', keymakers('generic_ld')(Model).get);

		let storage = AtomicFactory.create('BasicAsync', {
			type: storage_data_model,
			accessor: storage_accessor
		});

		//@NOTE: actually not content, but atomic
		this.membership = storage;
		return this;
	}

	getContent() {
		return this.content;
	}

	getEmployee(query) {
		return this.content.resolve(query)
			.then((res) => {
				return res.serialize();
			});
	}

	setEmployeeField(query, assignment) {
		return this.getEmployee(query)
			.then((res) => {
				let set = _.map(res, (emp) => {
					return _.defaults(assignment, emp);
				});
				return this.setEmployee(set);
			});
	}

	setEmployee(data) {
		return this.content.save(data);
	}

	getEmployeeRoles(id) {
		return this.membership.resolve({
				query: {
					member: id
				}
			})
			.then((res) => {
				return res.serialize();
			});
	}
}

module.exports = AgentApi;

// changeState() {}
// login() {}
// logout() {}
// pause() {}
// resume() {}
// getInfo() {}
// getWorkPlace() {}
// defaultWorkPlace() {}
// getAvailableWorkPlaces() {}