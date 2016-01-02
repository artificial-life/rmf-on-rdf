'use strict'

let u = require("./keymaker_utils");

module.exports = {
	get: function({
		query: p
	}) {
		let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		let date = p.date ? new Date(p.date) : new Date();
		let day = "iris://vocabulary/domain#" + days[date.getDay()];
		let plan_day_id = date.toLocaleDateString(); // yyyy-mm-dd
		let op_keys = undefined;
		if(p.operator_id == '*') {
			op_keys = {
				select: "iris://vocabulary/domain#member",
				where: {
					"@type": "iris://vocabulary/domain#Membership",
					"iris://vocabulary/domain#role": "iris://vocabulary/domain#Operator"
				},
				transform: u.flatten_ld
			};
		} else {
			op_keys = _.isArray(p.operator_id) ? p.operator_id : [p.operator_id];
		}
		//return all plans/schedules that belong to persons with operators role
		let query = {
			type: 'view',
			key_depth: 1,
			query: {
				op_keys: op_keys,
				schedules: {
					select: "*",
					where: {
						"@type": "iris://vocabulary/domain#Schedule",
						'iris://vocabulary/domain#hasDay': day
					},
					test: function(data, query) {
						let res = u.flatten_ld(data["iris://vocabulary/domain#scheduleOf"])[0];
						return !!~_.indexOf(query.op_keys, res);
					}
				}
			},
			order: ['op_keys', 'schedules'],
			final: function(query) {
				let reduced = _.reduce(query.schedules, (acc, sch) => {
					let key = u.key_typecast(sch['@id'], {
						type: "plan",
						id: (id) => {
							return `${id}--${plan_day_id}`;
						}
					});
					let op = u.flatten_ld(sch["iris://vocabulary/domain#scheduleOf"])[0];
					acc[op] = acc[op] || [];
					acc[op].push(key);
					return acc;
				}, {});
				return reduced;
			}
		};
		return {
			query: query
		};
	},
	set: function(data) {
		let access = [];
		let opts = {};
		_.map(_.values(data), (val) => {
			let node = val.db_data;
			let cas = val.cas;
			delete val.key;
			delete val.cas;
			delete val.db_data;
			node["iris://vocabulary/domain#hasTimeDescription"] = JSON.stringify(val);
			access.push(node);
			if(cas) {
				opts[node['@id']] = {
					cas: cas
				};
			}
		})

		return {
			values: access,
			options: opts
		};
	}
};