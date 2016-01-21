'use strict'

let base_dir = "../../../";

let CommonApi = require("./CommonApi");
let getModel = require(base_dir + '/build/Classes/Atomic/type-discover.js');

class ServiceApi extends CommonApi {
	constructor() {
		super();
	}


	initContent() {
		super.initContent('Service');
		super.initContent('ServiceGroup');
		this.models = _.reduce(this.content, (acc, val, key) => {
			acc[key] = getModel.dataType(val.model_decription.type);
			return acc;
		}, {});
		return this;
	}

	getServiceTree(query) {
		let groups = {};
		let services = {};
		let direct = this.content['ServiceGroup'].accessor;
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
								return(item.service_group_name === 'root' || _.size(val) == 1) ? 'root' : item.id;
							});
						});
						return ordered;
					});
			});
	}

	getService(query) {
		return super.getEntry('Service', query);
	}

	setServiceField(query, assignment) {
		return super.setEntryField('Service', query, assignment);
	}

	setService(data) {
		return super.setEntry('Service', data);
	}

	getServiceGroup(query) {
		return super.getEntry('ServiceGroup', query);
	}
	setServiceGroupField(query, assignment) {
		return super.setEntryField('ServiceGroup', query, assignment);
	}

	setServiceGroup(data) {
		return super.setEntry('ServiceGroup', data);
	}
}

module.exports = ServiceApi;