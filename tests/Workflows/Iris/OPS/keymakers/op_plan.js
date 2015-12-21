'use strict'

let u = require("./keymaker_utils");

module.exports = {
	get: function(p) {
		let day = p.day ? "iris://vocabulary/domain#" + p.day : '*';
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
						type: "plan"
					});
					let op = u.flatten_ld(sch["iris://vocabulary/domain#scheduleOf"])[0];
					acc[op] = acc[op] || [];
					acc[op].push(key);
					return acc;
				}, {});
				return reduced;
			}
		};

		return query;

	}
};