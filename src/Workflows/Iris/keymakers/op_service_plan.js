'use strict'

let u = require("./keymaker_utils");

module.exports = {
	get: function({
		query
	}) {
		// console.log("QQ", query);
		if(!query)
			return {};
		let date = query.date;
		let day = query.day;
		let service_ids = (query.selection.service_id && query.selection.service_id !== "*") ? JSON.stringify(query.selection.service_id) : 'op.provides';
		let direct = '';
		let op_keys = undefined;
		if(query.operator_id == '*') {
			direct = "SELECT op.`@id` as operator, srv.`@id` as service, sch AS schedule FROM rdf mm  JOIN rdf op ON KEYS mm.member JOIN rdf srv ON KEYS " + service_ids + " JOIN rdf sch ON KEYS srv.has_schedule WHERE mm.`@type`='Membership' AND 'Operator' IN mm.`role` and '" + day + "' IN sch.has_day";
		} else {
			op_keys = _.isArray(query.operator_id) ? query.operator_id : [query.operator_id];
			direct = "SELECT op.`@id` as operator,  srv.`@id` as service, sch AS schedule FROM rdf op USE KEYS " + JSON.stringify(op_keys) + " JOIN rdf srv ON KEYS " + service_ids + " JOIN rdf sch ON KEYS srv.has_schedule WHERE '" + day + "' IN sch.has_day";
		}

		let req = {
			type: 'view',
			key_depth: 2,
			forward: true,
			query: {
				schedules: {
					direct
				}
			},
			final: function(query) {
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