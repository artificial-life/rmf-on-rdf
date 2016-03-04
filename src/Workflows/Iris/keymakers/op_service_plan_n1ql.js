'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQ", query);
		if (!query)
			return {};
		let service_ids = (query.selection.service_id && query.selection.service_id !== "*") ? JSON.stringify(query.selection.service_id) : 'op.provides';
		let direct = '';
		if (query.operator_id == '*') {
			direct = `SELECT op.\`@id\` as operator, srv.\`@id\` as service, sch AS schedule FROM rdf mm  JOIN rdf op ON KEYS mm.member JOIN rdf srv ON KEYS ${service_ids} JOIN rdf sch ON KEYS srv.has_schedule.${query.method} WHERE mm.\`@type\`='Membership' AND ('Operator' IN mm.\`role\` OR mm.\`role\`='Operator') and '${query.day}' IN sch.has_day`;
		} else {
			let op_keys = _.castArray(query.operator_id);
			direct = `SELECT op.\`@id\` as operator,  srv.\`@id\` as service, sch AS schedule FROM rdf op USE KEYS ${JSON.stringify(op_keys)} JOIN rdf srv ON KEYS  ${service_ids}  JOIN rdf sch ON KEYS srv.has_schedule.${query.method} WHERE '${query.day}' IN sch.has_day`;
		}

		let req = {
			type: 'n1ql',
			key_depth: 2,
			forward: true,
			query: {
				schedules: {
					direct
				}
			},
			final: function (query) {
				// console.log("SPLAN QUERY", query);
				let reduced = _.reduce(query.schedules, (acc, val) => {
					acc[val.operator] = acc[val.operator] || {};
					acc[val.operator][val.service] = val.schedule;
					return acc;
				}, {});
				// console.log("REDUCED SPLANS", reduced);
				return reduced;
			}
		};

		return {
			query: req
		};
	}
};
