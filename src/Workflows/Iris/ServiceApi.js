'use strict'
let base_dir = "../../../";
let CommonApi = require("./CommonApi");
let default_user_info_fields = 'user_info_fields';
let default_cache_service_ids = 'cache_service_ids';
let default_service_quota = 'cache_service_quota';

class ServiceApi extends CommonApi {
	constructor(cfg = {}) {
		let config = _.merge({
			user_info_fields: default_user_info_fields,
			cache_service_quota: default_service_quota,
			cache_service_ids: default_cache_service_ids
		}, cfg);
		super({
			startpoint: config
		});
	}

	initContent() {
		super.initContent('Service');
		super.initContent('ServiceGroup');
		return this;
	}

	getUserInfoFields() {
		return this.db.get(this.startpoint.user_info_fields)
			.then((res) => (_.pickBy(res.value, (val, key) => !_.startsWith(key, "@")) || {}))
			.catch((err) => {});
	}

	cacheServiceIds() {
		return this.db.N1ql.direct({
				query: `SELECT  \`@id\` as id FROM ${this.db.bucket_name} WHERE  \`@type\`='Service' ORDER BY id ASC`
			})
			.then((res) => {
				return this.db.upsert(this.startpoint.cache_service_ids, {
					"@id": this.startpoint.cache_service_ids,
					"@type": "Cache",
					"content": _.map(res, 'id')
				});
			});
	}

	cacheServiceQuota(data) {
		return this.db.upsert(this.startpoint.cache_service_quota, {
			"@id": this.startpoint.cache_service_quota,
			"@type": "Cache",
			"content": data
		});
	}

	getServiceQuota() {
		return this.db.get(this.startpoint.cache_service_quota)
			.then((res) => res.value.content)
			.catch((err) => {});
	}

	lockQuota() {
		return this.db.get(this.startpoint.cache_service_quota + '-flag')
			.then(cnt => {
				if (cnt && (cnt.value > 0))
					return Promise.reject(new Error("Locked"));
				return this.db.counter(this.startpoint.cache_service_quota + '-flag', 1, {
					initial: 1
				});
			});
	}
	unlockQuota() {
		return this.db.get(this.startpoint.cache_service_quota + '-flag')
			.then(cnt => {
				if (cnt && (cnt.value < 1))
					return true;
				return this.db.counter(this.startpoint.cache_service_quota + '-flag', -1, {
					initial: 0
				});
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
						if (!val)
							return Promise.resolve({});
						let type = val.value['@type'];
						let Model = this.models[type];
						let item = new Model();
						item.build(val);
						let data = item.serialize();
						if (type === "ServiceGroup") {
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
							let cnt = _.castArray(val.content);
							cnt = _.map(cnt, (key) => {
								return groups[key] || services[key];
							});
							return _.merge({}, val, {
								content: cnt
							});
						});
						let ordered = _.mapValues(_.groupBy(nested, 'view_name'), (val) => {
							return _.keyBy(val, (item) => {
								return (item.view_order == "0" || _.size(val) == 1) ? 'root' : item.id;
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
module.exports = ServiceApi;
