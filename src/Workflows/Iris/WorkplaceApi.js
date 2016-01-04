'use strict'

//utility
let keymakers = require("./keymakers");
let base_dir = "../../../";

//Model
let Workplace = require(base_dir + '/build/Classes/Atomic/BaseTypes/Workplace');
//Atomics
let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');
//DP
let CouchbirdLinkedDataProvider = require(base_dir + '/build/externals/CouchbirdLinkedDataProvider');
//accessor
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor');
//parent
let IrisApi = require("./IrisApi");

class WorkplaceApi extends IrisApi {
	constructor() {
		super();
	}

	initContent() {
		let dp = new CouchbirdLinkedDataProvider(this.db);

		let storage_data_model = {
			type: 'Workplace',
			deco: 'BaseCollection',
			params: 'workplace_id'
		};

		let storage_accessor = new LDAccessor(dp);

		storage_accessor.keymaker('set', (data) => {
				let items = _.isArray(data) ? data : [data];
				let res = _.map(items, (t_data) => {
					let item = new Workplace();
					item.build(t_data);
					return item;
				});
				//@TODO: some checks?
				return keymakers.workplace.set(res);
			})
			.keymaker('get', (data) => {
				let res = data;
				if(data.query) {
					let item = new Workplace();
					item.build(data.query);
					res.query = item.getAsQuery();
				}
				//@TODO: some checks?
				return keymakers.workplace.get(res);
			});

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

	getWorkplace(query, factory_params = {}) {
		return this.content.resolve(query)
			.then((res) => {
				return res.serialize();
			});
	}

	setWorkplace(data) {
		return this.content.save(data);
	}
}

module.exports = WorkplaceApi;