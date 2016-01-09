'use strict'
//utility
let keymakers = require("./keymakers");
let base_dir = "../../../";

//Model
let TypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/UserInfo');
let DecoModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/LDEntity');
//Atomics
let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');
//DP
let CouchbirdLinkedDataProvider = require(base_dir + '/build/externals/CouchbirdLinkedDataProvider');
//accessor
let LDCacheAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDCacheAccessor');
//parent
let IrisApi = require("./IrisApi");

class UserInfoApi extends IrisApi {
	constructor() {
		super();
	}

	initContent() {
		let translator = (prop) => {
			return "iris://vocabulary/domain#" + _.camelCase(prop);
		};
		let dp = new CouchbirdLinkedDataProvider(this.db);
		let datamodel = {
			type: {
				type: 'UserInfo',
				deco: 'LDEntity',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'user_id'
		};
		let Model = DecoModel.bind(DecoModel, TypeModel, translator);

		let accessor = new LDCacheAccessor(dp);
		accessor
			.keymaker('set', (data) => {
				let uis = _.isArray(data) ? data : [data];
				let res = _.map(uis, (t_data) => {
					let ui = new Model();
					ui.build(t_data);
					return ui;
				});
				return keymakers.user_info.set(res);
			})
			.keymaker('get', (data) => {
				let res = data;
				if(data.query) {
					let ui = new Model();
					ui.build(data.query);
					res.query = ui.getAsQuery();
				}
				//@TODO: some checks?
				return keymakers.user_info.get(res);
			})
			.template((key, ctx) => {
				let ui = new Model();
				let data = {
					value: ctx.query
				};
				data.value['@id'] = key;
				ui.build(data);

				return Promise.resolve(ui.serialize());
			});

		let ui_collection = AtomicFactory.create('BasicAsync', {
			type: datamodel,
			accessor: accessor
		});

		//@NOTE: actually not content, but atomic
		this.content = ui_collection;
		return this;
	}

	getContent() {
		return this.content;
	}

	getUserInfo(query) {
		return this.content.resolve(query)
			.then((res) => {
				return res.serialize();
			});
	}
	setUserInfo(data) {
		return this.content.save(data);
	}

}

module.exports = UserInfoApi;