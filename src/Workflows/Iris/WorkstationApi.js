'use strict'

//utility
let keymakers = require("./keymakers");
let base_dir = "../../../";

//Model
let TypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/Workstation');
let DecoModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/LDEntity');
//Atomics
let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');
//DP
let CouchbirdLinkedDataProvider = require(base_dir + '/build/externals/CouchbirdLinkedDataProvider');
//accessor
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor');
//parent
let IrisApi = require("./IrisApi");

class WorkstationApi extends IrisApi {
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
				type: 'Workstation',
				deco: 'LDEntity',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'workstation_id'
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
		return this;
	}

	getContent() {
		return this.content;
	}

	getWorkstation(query) {
		return this.content.resolve(query)
			.then((res) => {
				return res.serialize();
			});
	}
	setWorkstationField(query, assignment) {
		return this.getWorkstation(query)
			.then((res) => {
				let set = _.map(res, (emp) => {
					return _.defaults(assignment, emp);
				});
				console.log("WP", require('util').inspect(set, {
					depth: null
				}));
				return this.setWorkstation(set);
			});
	}
	setWorkstation(data) {
		return this.content.save(data);
	}
}

module.exports = WorkstationApi;