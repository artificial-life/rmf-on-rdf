'use strict'

let keymakers = require("./keymakers");
let base_dir = "../../../";
let getModel = require(base_dir + '/build/Classes/Atomic/type-discover.js');

//Atomics
let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');
//DP
let CouchbirdDataProvider = require(base_dir + '/build/externals/CouchbirdDataProvider');
//accessor
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor');
//parent
let IrisApi = require("./IrisApi");

class AdminApi extends IrisApi {
	constructor() {
		super();
		this.content = {};
	}

	initContent(ModelName) {
		let dp = new CouchbirdDataProvider(this.db);
		let storage_data_model = {
			type: {
				deco: 'AdHocEntity',
				params: (type) => getModel({
					type
				})
			},
			deco: 'BaseCollection',
			params: 'id'
		};

		let storage_accessor = new LDAccessor(dp);

		storage_accessor
			.keymaker('set', keymakers('generic')().set)
			.keymaker('get', keymakers('generic')(Model, snake_model).get);


		let storage = AtomicFactory.create('BasicAsync', {
			type: storage_data_model,
			accessor: storage_accessor
		});
		//@NOTE: actually not content, but atomic
		this.content[ModelName] = storage;

		return this;
	}

	getEntry(query) {
		return pre.then((tp) => {
			if(!tp || !this.content[tp])
				return {};
			return this.content[tp].resolve(query)
				.then((res) => {
					return res.serialize();
				});
		});
	}
}

module.exports = AdminApi;