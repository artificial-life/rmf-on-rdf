'use strict'

let keymakers = require("./keymakers");
let classmap = require("./classmap");
let base_dir = "../../../";

//Model
let TypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/Service');
let SGTypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/ServiceGroup');
let DecoModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/LDEntity');

//Atomics
let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');
//DP
let CouchbirdLinkedDataProvider = require(base_dir + '/build/externals/CouchbirdLinkedDataProvider');
//accessor
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor');
//parent
let IrisApi = require("./IrisApi");

class ServiceApi extends IrisApi {
	constructor() {
		super();
		this.models = {};
	}


	initContent() {
		let dp = new CouchbirdLinkedDataProvider(this.db);
		let translator = (prop) => {
			return "iris://vocabulary/domain#" + _.camelCase(prop);
		};
		let Model = DecoModel.bind(DecoModel, TypeModel, translator);
		this.models[TypeModel.name] = Model;
		let storage_data_model = {
			type: {
				type: 'Service',
				deco: 'LDEntity',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'service_id'
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

		this.initServiceGroupContent();

		return this;
	}

	initServiceGroupContent() {
		let dp = new CouchbirdLinkedDataProvider(this.db);
		let storage_accessor = new LDAccessor(dp);
		let translator = (prop) => {
			return "iris://vocabulary/domain#" + _.camelCase(prop);
		};
		let Model = DecoModel.bind(DecoModel, SGTypeModel, translator);
		this.models[SGTypeModel.name] = Model;
		let storage_data_model = {
			type: {
				type: 'ServiceGroup',
				deco: 'LDEntity',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'service_group_id'
		};

		storage_accessor
			.keymaker('set', keymakers('generic_ld')(Model).set)
			.keymaker('get', keymakers('generic_ld')(Model).get);

		let storage = AtomicFactory.create('BasicAsync', {
			type: storage_data_model,
			accessor: storage_accessor
		});

		//@NOTE: actually not content, but atomic
		this.service_groups = storage;
		return this;
	}

	getContent() {
		return this.content;
	}

	getService(query) {
		return this.content.resolve(query)
			.then((res) => {
				return res.serialize();
			});
	}

	getServiceTree(query) {
		let groups = {};
		let services = {};
		let direct = this.service_groups.accessor;
		let unroll = (keys) => {
			return direct.get({
					keys
				})
				.then((res) => {
					return Promise.props(_.mapValues(res, (val, key) => {
						let type = _.last(val.value['@type'][0].split("#"));
						let Model = this.models[type];
						let item = new Model();
						item.build(val);
						let data = item.serialize();
						if(type === "ServiceGroup") {
							groups[key] = data;
							return unroll(data.service_group_content);
						}
						services[key] = data;
						return Promise.resolve(data);
					}));
				});
		}
		return this.getServiceGroup(query)
			.then((res) => {
				return unroll(_.keys(res))
					.then((res) => {
						let nested = _.map(groups, (val, key) => {
							let cnt = _.isArray(val.service_group_content) ? val.service_group_content : [val.service_group_content];
							cnt = _.map(cnt, (key) => {
								return groups[key] || services[key];
							});
							return _.merge({}, val, {
								service_group_content: cnt
							});
						});
						let ordered = _.mapValues(_.groupBy(nested, 'service_group_type'), (val) => {
							return _.keyBy(val, (item) => {
								return(item.service_group_name === 'root') ? item.service_group_name : item.id;
							});
						});
						return ordered;
					});
			});
	}

	setServiceField(query, assignment) {
		return this.getService(query)
			.then((res) => {
				let set = _.map(res, (emp) => {
					return _.defaults(assignment, emp);
				});
				return this.setService(set);
			});
	}

	setServiceGroupField(query, assignment) {
		return this.getServiceGroup(query)
			.then((res) => {
				let set = _.map(res, (emp) => {
					return _.defaults(assignment, emp);
				});
				return this.setServiceGroup(set);
			});
	}

	setService(data) {
		return this.content.save(data);
	}

	getServiceGroup(query) {
		return this.service_groups.resolve(query)
			.then((res) => {
				return res.serialize();
			});
	}

	setServiceGroup(data) {
		return this.service_groups.save(data);
	}
}

module.exports = ServiceApi;