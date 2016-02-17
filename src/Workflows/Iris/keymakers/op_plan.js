'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQO", p);
		if (!query)
			return {};
		let direct = '';
		if (query.operator_id == '*') {
			direct = "SELECT op.`@id` as operator, sch AS schedule FROM rdf mm  JOIN rdf op ON KEYS mm.member JOIN rdf sch ON KEYS op.has_schedule WHERE  mm.`@type`='Membership' AND 'Operator' IN mm.`role` and '" + query.day + "' IN sch.has_day AND '" + query.method + "' IN sch.booking_methods";
		} else {
			let op_keys = _.isArray(query.operator_id) ? query.operator_id : [query.operator_id];
			direct = "SELECT op.`@id` as operator, sch AS schedule FROM rdf op USE KEYS " + JSON.stringify(op_keys) + " JOIN rdf sch ON KEYS op.has_schedule WHERE '" + query.day + "' IN sch.has_day AND '" + query.method + "' IN sch.booking_methods";
		}
		let req = {
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
			query: req
		};
	}
};
