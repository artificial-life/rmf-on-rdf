'use strict'

let base_dir = "../../../";

let CommonLDApi = require("./CommonLDApi");
let getModel = require(base_dir + '/build/Classes/Atomic/type-discover.js');

let default_fm_key = 'iris://config#terminal_fields_model';

class ServiceLDApi extends CommonLDApi {
	constructor(
		fields_model_key
	) {
		super();
		this.fields_model_key = fields_model_key || default_fm_key;
	}


	initContent() {
		super.initContent('Service');
		super.initContent('ServiceGroup');
		super.initContent('Organization');
		super.initContent('Schedule');
		this.models = _.reduce(this.content, (acc, val, key) => {
			acc[key] = getModel.dataType(val.model_decription.type);
			return acc;
		}, {});
		return this;
	}

	getFieldsModel() {
		return this.db.get(this.fields_model_key)
			.then((res) => (res.value || false))
			.catch((err) => false);
	}

	getOrganizationTree(query) {
		let recurse = (query) => {
			let org;
			return super.getEntry("Organization", query)
				.then((res) => {
					// console.log("RES I", res);
					org = res;
					let keys = _.compact(_.uniq(_.map(res, 'unit_of')));
					return _.isEmpty(keys) ? {} : recurse({
						keys
					});
				})
				.then((res) => {
					// console.log("RES II", res);
					return _.mapValues(org, (val) => {
						val.unit_of = res[val.unit_of];
						return _.defaults(val, val.unit_of);
					})
				})
		}
		return recurse(query);
	}

	getOrganizationChain(query) {
		let recurse = (query, level) => {
			let org = {};
			return super.getEntry("Organization", query)
				.then((res) => {
					org[level] = _.sample(res);
					let keys = _.compact(_.uniq(_.map(res, 'unit_of')));
					return _.isEmpty(keys) ? {} : recurse({
						keys
					}, level + 1);
				})
				.then((res) => {
					return _.merge(org, res);
				});
		}
		return recurse(query, 0);
	}

	getOrganizationSchedulesChain(query) {
		let prov;
		return this.getOrganizationChain(query)
			.then((res) => {
				prov = res;
				let keys = _.uniq(_.flatMap(_.values(res), (prov, key) => {
					return prov.has_schedule;
				}));
				return super.getEntry("Schedule", {
					keys
				});
			})
			.then((res) => {
				return _.mapValues(prov, (p, key) => {
					let sch = _.isArray(p.has_schedule) ? p.has_schedule : [p.has_schedule];
					p.has_schedule = _.map(sch, (schedule) => res[schedule]);
					return p;
				});
			});
	}

	getServiceProvider(query) {
		let out;
		let prov;
		return this.getService(query)
			.then((res) => {
				// console.log("SERVICES", res);
				out = _.groupBy(_.values(res), 'has_provider');
				let keys = _.keys(out);
				return this.getOrganizationTree({
					keys
				});
			})
			.then((res) => {
				prov = res;
				let keys = _.uniq(_.flatMap(_.values(res), (prov, key) => {
					return prov.has_schedule;
				}));

				return super.getEntry("Schedule", {
					keys
				})
			})
			.then((res) => {
				prov = _.mapValues(prov, (p, key) => {
					let sch = _.isArray(p.has_schedule) ? p.has_schedule : [p.has_schedule];
					p.has_schedule = _.map(sch, (schedule) => res[schedule]);
					return p;
				});

				return _.map(prov, (p, k) => {
					return {
						services: out[k],
						provider: p
					}
				})
			});
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
						if(!val)
							return Promise.resolve({});
						let type = _.last(val.value['@type'][0].split("#"));
						let Model = this.models[type];
						let item = new Model();
						item.build(val);
						let data = item.serialize();
						if(type === "ServiceGroup") {
							groups[key] = data;
							return unroll(data.content);
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
							let cnt = _.isArray(val.content) ? val.content : [val.content];
							cnt = _.map(cnt, (key) => {
								return groups[key] || services[key];
							});
							return _.merge({}, val, {
								content: cnt
							});
						});
						let ordered = _.mapValues(_.groupBy(nested, 'view_name'), (val) => {
							return _.keyBy(val, (item) => {
								return(item.order == "0" || _.size(val) == 1) ? 'root' : item.id;
							});
						});
						// console.log("ORDERED", require('util').inspect(ordered, {
						// 	depth: null
						// }));
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

module.exports = ServiceLDApi;