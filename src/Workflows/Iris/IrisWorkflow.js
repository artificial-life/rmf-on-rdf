'use_strict'

let RDFcb = require("cbird-rdf").LD;

let TSFactoryDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/TSFactoryDataProvider.js');
let CouchbirdLinkedDataProvider = require(_base + '/build/externals/CouchbirdLinkedDataProvider.js');

let LDCacheAccessor = require(_base + '/build/Classes/Atomic/Accessor/LDCacheAccessor');
var BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor.js');
var LDAccessor = require(_base + '/build/Classes/Atomic/Accessor/LDAccessor.js');

var ContentAsync = require(_base + '/build/Classes/ContentAsync.js');
let ResourceFactoryAsync = require(_base + '/build/Classes/ResourceFactoryAsync.js');

let AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');

//functional helpers
let keymakers = require(_base + "/tests/Workflows/Iris/OPS/keymakers");
let classmap = {
	common_id: new RegExp("(.*)#([^-]*)-([^\/]*)"),
	classes: {
		plan: {
			template: {
				type: () => "schedule",
				id: (id) => {
					return id.split('--')[0];
				}
			},
			map_keys: {
				"iris://vocabulary/domain#scheduleOf": "iris://vocabulary/domain#planOf"
			},
			map_values: {
				"iris://vocabulary/domain#hasTimeDescription": function(value) {
					let parsed = JSON.parse(value[0]['@value']);
					return _.map(parsed, (chunk) => {
						return {
							data: [chunk],
							state: 'a'
						};
					});
				}
			},
			typecast: "iris://vocabulary/domain#Plan"
		}
	}
};

//temporary here
//@TODO make all this bullshit in a righteous way
class IrisWorkflow {
	constructor() {}
	init(cfg) {
		this.db = new RDFcb(cfg.couchbird);
		let dp = new CouchbirdLinkedDataProvider(this.db.bucket(cfg.buckets.main));

		let ops_plan_accessor = new LDCacheAccessor(dp);
		ops_plan_accessor.mapper(classmap);
		let services_accessor = new LDCacheAccessor(dp);
		services_accessor.mapper(classmap);

		ops_plan_accessor.keymaker('get', keymakers.op_plan.get);
		ops_plan_accessor.keymaker('set', keymakers.op_plan.set);
		services_accessor.keymaker('get', keymakers.op_service_plan.get);

		let resource_source = new ContentAsync();

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

		resource_source.addAtom(plan_collection, 'plan');
		resource_source.addAtom(operator_services_collection, 'services', '<namespace>attribute');
		////////////////
		let data_model = {
			type: {
				type: {
					deco: 'Box',
					type: ['LDPlan']
				},
				deco: 'BaseCollection',
				params: 'box_id'
			},
			deco: 'BaseCollection',
			params: 'service_id'
		};

		let c_data_model = {
			type: {
				deco: 'BaseCollection',
				type: ['LDPlan']
			},
			deco: 'BaseCollection',
			params: 'box_id'
		};


		let factory_provider = new TSFactoryDataProvider();

		let factory_accessor = new BasicAccessor(factory_provider);
		factory_accessor.keymaker('set', (p) => {
				let keys = [];
				_.forEach(p, (boxes, s_id) => {
					_.forEach(boxes, (box, box_id) => {
						keys.push([s_id, box_id]);
					});
				});
				return keys;
			})
			.keymaker('get', (p) => p); //maybe here data resolve logic

		let storage_accessor = new LDAccessor(dp);
		storage_accessor.keymaker('set', keymakers.ticket.set)
			.keymaker('get', keymakers.ticket.get);

		this.storage_accessor = storage_accessor;

		factory_provider
			.addIngredient('ldplan', resource_source)
			.addStorage(storage_accessor);


		let box_builder = AtomicFactory.create('BasicAsync', {
			type: data_model,
			accessor: factory_accessor
		});

		let box_storage = AtomicFactory.create('BasicAsync', {
			type: c_data_model,
			accessor: storage_accessor
		});

		this.factory = new ResourceFactoryAsync();
		this.factory
			.addAtom(box_builder, 'box', '<namespace>builder')
			.addAtom(box_storage, 'box', '<namespace>content');

	}

	build(query) {
		this.factory.selector().reset()
			.add()
			.id('<namespace>builder').id('box').query(query);
		return this.factory.build()
			.then((produced) => {
				this.produced = produced;
				return this;
			});
	}

	observe(query) {
		this.produced.selector().reset()
			.add()
			.id('<namespace>builder').id('box').query(query);
		return this.produced.observe();
	}

	reserve(query) {
		this.produced.selector().reset()
			.add()
			.id('<namespace>builder').id('box').query(query);
		return this.produced.reserve();
	}
	save() {
		return this.produced.save();
	}

	getTicketsData(query) {
		return this.storage_accessor.get({
			query: query,
			options: {}
		});
	}
}
module.exports = IrisWorkflow;