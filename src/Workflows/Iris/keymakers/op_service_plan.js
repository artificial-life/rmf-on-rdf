'use strict'

let u = require("./keymaker_utils");

module.exports = {
	get: function({
		query: query
	}) {
		// console.log("QQ", query);
		if(!query)
			return {};
		let date = query.date;
		let day = "iris://vocabulary/domain#" + query.day;
		let service_ids = query.selection.service_id || '*';
		let op_keys = undefined;
		if(query.operator_id == '*') {
			op_keys = {
				select: "iris://vocabulary/domain#member",
				where: {
					"@type": "iris://vocabulary/domain#Membership",
					"iris://vocabulary/domain#role": "iris://vocabulary/domain#Operator"
				},
				transform: u.flatten_ld
			};
		} else {
			op_keys = _.isArray(query.operator_id) ? query.operator_id : [query.operator_id];
		}

		let service_keys = undefined;
		service_keys = {
			select: "*",
			where: {
				"@type": "iris://vocabulary/domain#Employee"
			},
			test: function(data, query) {
				let res = data["@id"];
				return !!~_.indexOf(query.op_keys, res);
			},
			transform: function(data) {
				let keys = _.isArray(service_ids) ? service_ids : [service_ids];
				let check = [];
				let result = _.transform(data, (acc, item) => {
					let res = u.flatten_ld(item["iris://vocabulary/domain#provides"]);
					acc[item['@id']] = (service_ids == '*') ? res : _.intersection(res, keys);
					check = _.concat(check, acc[item['@id']]);
					return acc;
				}, {});
				// console.log("CHECK", check);
				result.check_keys = _.uniq(check);
				return result;
			}
		};

		let req = {
			type: 'view',
			key_depth: 2,
			query: {
				op_keys: op_keys,
				service_keys: service_keys,
				schedules: {
					select: "*",
					where: {
						"@type": "iris://vocabulary/domain#Schedule",
						'iris://vocabulary/domain#hasDay': day
					},
					test: function(data, query) {
						let res = u.flatten_ld(data["iris://vocabulary/domain#scheduleOf"])[0];
						return !!~_.indexOf(query.service_keys.check_keys, res);
					}
				}
			},
			order: ['op_keys', 'service_keys', 'schedules'],
			final: function(query) {
				// console.log("QUERY", query);
				let grouped = _.groupBy(query.schedules, function(sch) {
					return u.flatten_ld(sch["iris://vocabulary/domain#scheduleOf"])[0];
				});

				delete query.service_keys.check_keys;
				let reduced = _.transform(query.service_keys, (res, s_ids, op_id) => {
					res[op_id] = _.reduce(s_ids, (acc, s_id) => {
						acc[s_id] = _.map(grouped[s_id], (val) => {
							// return u.key_typecast(val['@id'], {
							// 	type: 'plan'
							// });
							return val['@id'];
						});
						return acc;
					}, {});
				});
				// console.log("REDUCED SS", reduced);
				return reduced;
			}
		};

		return {
			query: req
		};
	}
};