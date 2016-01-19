'use strict'

let keymakers = require("./keymakers");
let classmap = require("./classmap");
let base_dir = "../../../";

//Model
let TypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/Service');
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

class ServiceApi extends IrisApi {
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
				type: 'Service',
				deco: 'LDEntity',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'service_id'
		};


		let storage_accessor = new LDAccessor(dp);

		storage_accessor
			.keymaker('set', keymakers('generic_ld')(Model).set)
			.keymaker('get', keymakers('generic_ld')(Model).get);


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

	getService(query) {
		return this.content.resolve(query)
			.then((res) => {
				return res.serialize();
			});
	}

	setServiceField(query, assignment) {
		return this.getService(query)
			.then((res) => {
				let set = _.map(res, (emp) => {
					return _.defaults(assignment, emp);
				});
				return this.setService(set);
			});
	}

	setService(data) {
		return this.content.save(data);
	}

	getServiceRoles(id) {
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

module.exports = ServiceApi;