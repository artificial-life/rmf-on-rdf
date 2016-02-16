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
		let direct = '';
		let plan_day_id = date; // yyyy-mm-dd
		let op_keys = undefined;
		if (p.operator_id == '*') {
			direct = "SELECT op.`@id` as operator, sch AS schedule FROM rdf mm  JOIN rdf op ON KEYS mm.member JOIN rdf sch ON KEYS op.has_schedule_resource WHERE  mm.`@type`='Membership' AND 'Operator' IN mm.`role` and '" + day + "' IN sch.has_day";
		} else {
			op_keys = _.isArray(p.operator_id) ? p.operator_id : [p.operator_id];
			direct = "SELECT op.`@id` as operator, sch AS schedule FROM rdf op USE KEYS " + JSON.stringify(op_keys) + " JOIN rdf sch ON KEYS op.has_schedule_resource WHERE '" + day + "' IN sch.has_day";
		}
		let query = {
			type: 'view',
			key_depth: 1,
			query: {
				schedules: {
					direct
				}
			},
			final: function (query) {
				let templates = {};
				let reduced = _.reduce(query.schedules, (acc, val) => {
					acc[val.operator] = `${val.operator}-plan--${plan_day_id}`;
					templates[val.operator] = val.schedule;
					return acc;
				}, {});
				// console.log("FIN TEMPLATES", reduced, templates);
				return {
					keys: reduced,
					templates
				};
			}
		};
		return {
			query
		};
	},
	set: function (data) {
		let access = [];
		let opts = {};
		_.map(_.values(data), (val) => {
			let node = val;
			let cas = val.cas;
			delete val.key;
			delete val.cas;
			access.push(node);
			if (cas) {
				opts[node['@id']] = {
					cas
				};
			}
		})
		console.log("SETTING OTPLAN", access, data);
		return {
			values: access,
			options: opts
		};
	}
};
