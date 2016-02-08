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

class CommonApi extends IrisApi {
	constructor() {
		super();
		this.content = {};
	}

	getEntryType(key) {
		let id = _.isArray(key) ? key[0] : key;
		return this.db.get(id)
			.then((res) => {
				let data = res.value;
				return data['@type'] || false;
			})
			.catch((err) => {
				return false;
			});
	}

	initContent(ModelName) {
		let dp = new CouchbirdDataProvider(this.db);
		let storage_data_model = {
			type: {
				type: ModelName,
				deco: 'RawEntity'
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
		this.content[ModelName] = storage;

		return this;
	}

	getContent(ModelName) {
		return this.content[ModelName];
	}

	getEntry(type, query) {
		let pre = ((!type || !this.content[type]) && query.keys) ? this.getEntryType(query.keys) : Promise.resolve(type);

		return pre.then((tp) => {
			if(!tp || !this.content[tp])
				return {};
			return this.content[tp].resolve(query)
				.then((res) => {
					return res.serialize();
				});
		});
	}

	getAllEntries(query) {
		return Promise.props(_.reduce(_.keys(this.content), (acc, key) => {
			acc[key] = this.getEntry(key, query);
			return acc;
		}, {}));
	}

	setEntryField(type, query, assignment, concat = true) {
		let pre = (!type || !this.content[type]) && query.keys ? this.getEntryType(query.keys) : Promise.resolve(type);

		return pre.then(tp => {
			if(!tp || !this.content[tp])
				return {};
			let t = assignment;
			return this.getEntry(tp, query)
				.then(res => {
					let set = _.map(res, entry => {
						return _.mergeWith(entry, t, (objValue, srcValue, key) => {
							if(concat) {
								let val = objValue ? (_.isArray(objValue) ? objValue : [objValue]) : [];
								return _.uniq(_.concat(val, srcValue));
							}
						});
					});
					return this.setEntry(tp, set);
				});
		});
	}

	setEntry(type, data) {
		let tp = (!type || !this.content[type]) ? data[0].ldtype : type;
		if(!tp || !this.content[tp])
			return {};
		return this.content[tp].save(data);
	}

}

module.exports = CommonApi;