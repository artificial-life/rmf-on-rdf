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

let TypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/Ticket');
let DecoModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/LDEntity');

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
		let translator = (prop) => {
			return "iris://vocabulary/domain#" + _.camelCase("has_" + prop);
		};

		let data_model = {
			type: {
				deco: 'LDEntity',
				type: 'Ticket',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'box_id'
		};

		//setting resource volume
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
		factory_accessor.keymaker('set', (query) => {
				return {
					selection: {
						ldplan: {
							operator: '*',
							service: '*',
							dedicated_date: query.dedicated_date,
							time_description: query.time_description
						}
					},
					reserve: query.reserve || false
				};
			})
			.keymaker('get', (query) => {
				let s_ids = _.map(query.services, 'service');
				return {
					selection: {
						ldplan: {
							operator: '*',
							service: '*',
							dedicated_date: query.dedicated_date,
							time_description: query.time_description
						}
					},
					services: query.services,
					box_id: '*',
					count: query.count
				};
			});

		let t_api = new TicketApi();
		let box_storage = t_api.initContent().getContent();


		let Model = DecoModel.bind(DecoModel, TypeModel, translator);

		factory_provider
			.addStorage(box_storage)
			.addFinalizer((data) => {
				let tickets = _.filter(data, _.isPlainObject);
				let res = _.map(tickets, (t_data) => {
					let ticket = new Model();
					ticket.build(t_data);
					return ticket.serialize();
				});
				return res;
			});

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

}

module.exports = IrisBuilder;