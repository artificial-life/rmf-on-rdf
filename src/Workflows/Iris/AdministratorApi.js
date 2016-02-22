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

class AdministratorApi extends IrisApi {
	constructor() {
		super();
		this.content = {};
	}

	initContent(ModelName) {
		let dp = new CouchbirdDataProvider(this.db);
		let discover = (type) => {
			try {
				let Model = getModel({
					type
				});
				return Model;
			} catch(err) {
				return false;
			}
		};
		let storage_data_model = {
			type: {
				type: 'UnboundFieldset',
				deco: 'AdHocEntity',
				params: discover
			},
			deco: 'BaseCollection',
			params: 'id'
		};

		let Model = getModel.dataType(storage_data_model.type);
		let snake_model = _.snakeCase(ModelName);
		let storage_accessor = new LDAccessor(dp);

		storage_accessor
			.keymaker('set', keymakers('generic')(Model, snake_model).set)
			.keymaker('get', keymakers('generic')(Model, snake_model).get);

		let storage = AtomicFactory.create('BasicAsync', {
			type: storage_data_model,
			accessor: storage_accessor
		});
		//@NOTE: actually not content, but atomic
		this.content = storage;

		return this;
	}

	getEntry(query) {
		return this.content.resolve(query)
			.then((res) => {
				return res.serialize();
			});
	}

	setEntryField(query, assignment, concat = true) {
		let t = assignment;
		return this.getEntry(query)
			.then(res => {
				let set = _.map(res, entry => {
					return _.mergeWith(entry, t, (objValue, srcValue, key) => {
						if(concat && _.isArray(objValue)) {
							let val = objValue ? _.castArray(objValue) : [];
							return _.uniq(_.concat(val, srcValue));
						} else if(!concat && _.isArray(objValue)) {
							return _.castArray(srcValue);
						}
					});
				});
				return this.setEntry(set);
			});
	}

	setEntry(data) {
		return this.content.save(data);
	}
}

module.exports = AdministratorApi;