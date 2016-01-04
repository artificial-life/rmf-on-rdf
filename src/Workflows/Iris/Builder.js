'use strict'

let keymakers = require("./keymakers");
let classmap = require("./classmap");
let base_dir = "../../../";

let TicketApi = require("./TicketApi");

let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');

let TSFactoryDataProvider = require(base_dir + '/build/Classes/Atomic/DataProvider/TSFactoryDataProvider');
let TSIngredientDataProvider = require(base_dir + '/build/Classes/Atomic/DataProvider/TSIngredientDataProvider');
let CouchbirdLinkedDataProvider = require(base_dir + '/build/externals/CouchbirdLinkedDataProvider');

let LDCacheAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDCacheAccessor');
let BasicAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/BasicAccessor');
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor.js');

let ContentAsync = require(base_dir + '/build/Classes/ContentAsync');
let ResourceFactoryAsync = require(base_dir + '/build/Classes/ResourceFactoryAsync');

let UserInfo = require(base_dir + '/build/Classes/Atomic/BaseTypes/UserInfo');

class IrisBuilder {
	static init(db, cfg) {
		this.default_slot_size = cfg.default_slot_size;
		this.db = db;
	}
	static getResourceSource() {
		let dp = new CouchbirdLinkedDataProvider(this.db);

		let ops_plan_accessor = new LDCacheAccessor(dp);
		let services_accessor = new LDCacheAccessor(dp);

		ops_plan_accessor.mapper(classmap);
		services_accessor.mapper(classmap);

		ops_plan_accessor
			.keymaker('get', keymakers.op_plan.get)
			.keymaker('set', keymakers.op_plan.set);
		services_accessor.keymaker('get', keymakers.op_service_plan.get);


		let datamodel = {
			type: 'LDPlan',
			deco: 'BaseCollection',
			params: 'operator_id'
		};

		let attributes_services_datamodel = {
			type: {
				type: 'LDPlan',
				deco: 'BaseCollection',
				params: 'service_id'
			},
			deco: 'BaseCollection',
			params: 'operator_id'
		};

		let plan_collection = AtomicFactory.create('BasicAsync', {
			type: datamodel,
			accessor: ops_plan_accessor
		});

		let operator_services_collection = AtomicFactory.create('BasicAsync', {
			type: attributes_services_datamodel,
			accessor: services_accessor
		});

		let resource_source = new ContentAsync();

		resource_source.addAtom(plan_collection, 'plan');
		resource_source.addAtom(operator_services_collection, 'services', '<namespace>attribute');

		return resource_source;
	}

	static getFactory(ingredients) {
		let dp = new CouchbirdLinkedDataProvider(this.db);

		let data_model = {
			type: {
				deco: 'Box',
				type: ['LDPlan']
			},
			deco: 'BaseCollection',
			params: 'box_id'
		};


		let factory_provider = new TSFactoryDataProvider();
		_.map(ingredients, (resource_source, key) => {
			let i_provider = new TSIngredientDataProvider();
			i_provider
				.setIngredient(key, resource_source)
				.setSize(this.default_slot_size);
			factory_provider
				.addIngredient(key, i_provider);
		});

		let factory_accessor = new BasicAccessor(factory_provider);
		factory_accessor.keymaker('set', (p) => {
				return _.keys(p);
			})
			.keymaker('get', (p) => p);

		let t_api = new TicketApi();
		let box_storage = t_api.initContent().getContent();

		factory_provider
			.addStorage(box_storage.accessor);

		let box_builder = AtomicFactory.create('BasicAsync', {
			type: data_model,
			accessor: factory_accessor
		});

		let factory = new ResourceFactoryAsync();
		factory
			.addAtom(box_builder, 'box', '<namespace>builder')
			.addAtom(box_storage, 'box', '<namespace>content');

		return factory;
	}

	static getUserInfoStorage() {
		let dp = new CouchbirdLinkedDataProvider(this.db);
		let datamodel = {
			type: 'UserInfo',
			deco: 'BaseCollection',
			params: 'user_id'
		};

		let accessor = new LDCacheAccessor(dp);
		accessor
			.keymaker('set', (data) => {
				let uis = _.isArray(data) ? data : [data];
				let res = _.map(uis, (t_data) => {
					let ui = new UserInfo();
					ui.build(t_data);
					return ui;
				});
				return keymakers.user_info.set(res);
			})
			.keymaker('get', (data) => {
				let res = data;
				if(data.query) {
					let ui = new UserInfo();
					ui.build(data.query);
					res.query = ui.getAsQuery();
				}
				//@TODO: some checks?
				return keymakers.user_info.get(res);
			})
			.template((key, ctx) => {
				let ui = new UserInfo();
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

		let resource_source = new ContentAsync();
		resource_source.addAtom(ui_collection, 'user_info');

		return resource_source;
	}
}

module.exports = IrisBuilder;