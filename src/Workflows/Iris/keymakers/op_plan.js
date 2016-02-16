'use strict'

let u = require("./keymaker_utils");

module.exports = {
	get: function ({
		query: p
	}) {
		// console.log("QQO", p);
		if (!p)
			return {};
		let date = p.date;
		let day = p.day;
		let method = p.method;
		let direct = '';
		let plan_day_id = date; // yyyy-mm-dd
		let op_keys = undefined;
		if (p.operator_id == '*') {
			direct = "SELECT op.`@id` as operator, sch AS schedule FROM rdf mm  JOIN rdf op ON KEYS mm.member JOIN rdf sch ON KEYS op.has_schedule WHERE  mm.`@type`='Membership' AND 'Operator' IN mm.`role` and '" + day + "' IN sch.has_day AND '" + method + "' IN sch.booking_methods";
		} else {
			op_keys = _.isArray(p.operator_id) ? p.operator_id : [p.operator_id];
			direct = "SELECT op.`@id` as operator, sch AS schedule FROM rdf op USE KEYS " + JSON.stringify(op_keys) + " JOIN rdf sch ON KEYS op.has_schedule WHERE '" + day + "' IN sch.has_day AND '" + method + "' IN sch.booking_methods";
		}
		let query = {
			type: 'view',
			key_depth: 1,
			forward: true,
			query: {
				schedules: {
					direct
				}
			},
			final: function (query) {
				let reduced = _.reduce(query.schedules, (acc, val) => {
					acc[val.operator] = val.schedule;
					return acc;
				}, {});
				// console.log("RES FIN ", reduced);
				return reduced;
			}
		};
		return {
			query
		};
	}
};
