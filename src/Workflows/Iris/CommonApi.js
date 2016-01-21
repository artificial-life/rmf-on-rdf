'use strict'

let keymakers = require("./keymakers");
let base_dir = "../../../";
let getModel = require(base_dir + '/build/Classes/Atomic/type-discover.js');

//Atomics
let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');
//DP
let CouchbirdLinkedDataProvider = require(base_dir + '/build/externals/CouchbirdLinkedDataProvider');
//accessor
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor');
//parent
let IrisApi = require("./IrisApi");

class CommonApi extends IrisApi {
	constructor() {
		super();
		this.content = {};
	}

	checkEntryType(key) {
		let k = _.isArray(key) ? key[0] : key;
		return this.db.get(k)
			.then((res) => {
				let data = res.value;
				return data['@type'] ? _.last(data['@type'][0].split("#")) : false;
			})
			.catch((err) => {
				return false;
			});
	}

	initContent(ModelName, translator_fn) {
		let dp = new CouchbirdLinkedDataProvider(this.db);
		let translator = _.isFunction(translator_fn) ? translator_fn : (prop) => {
			return "iris://vocabulary/domain#" + _.camelCase(prop);
		};
		let storage_data_model = {
			type: {
				type: ModelName,
				deco: 'LDEntity',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'id'
		};

		let Model = getModel.dataType(storage_data_model.type);
		let snake_model = _.snakeCase(ModelName);
		let storage_accessor = new LDAccessor(dp);

		storage_accessor
			.keymaker('set', keymakers('generic_ld')(Model, snake_model).set)
			.keymaker('get', keymakers('generic_ld')(Model, snake_model).get);


		let storage = AtomicFactory.create('BasicAsync', {
			type: storage_data_model,
			accessor: storage_accessor
		});
		//@NOTE: actually not content, but atomic
		this.content[ModelName] = storage;

		return this;
	}

	getContent(ModelName) {
		return this.content[ModelName];
	}

	getEntry(type, query) {
		let pre = ((!type || !this.content[type]) && query.keys) ? this.checkEntryType(query.keys) : Promise.resolve(type);

		return pre.then((tp) => {
			if(!tp || !this.content[tp])
				return {};
			return this.content[tp].resolve(query)
				.then((res) => {
					return res.serialize();
				});
		});
	}

	setEntryField(type, query, assignment) {
		return this.getEntry(type, query)
			.then((res) => {
				let set = _.map(res, (entry) => {
					return _.defaults(assignment, entry);
				});
				return this.setEntry(type, set);
			});
	}

	setEntry(type, data) {
		let pre = ((!type || !this.content[type]) && query.keys) ? this.checkEntryType(query.keys) : Promise.resolve(type);

		return pre.then((tp) => {
			if(!tp || !this.content[tp])
				return {};

			return this.content[type].save(data);
		});
	}

}

module.exports = CommonApi;