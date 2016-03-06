'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQO", query);
		if (!query)
			return {};
		let direct = '';
		let plan_id = query.date;
		if (query.operator_id == '*') {
			direct = `SELECT op.\`@id\` as operator, sch AS schedule FROM rdf mm  JOIN rdf op ON KEYS mm.member JOIN rdf sch ON KEYS op.has_schedule.resource WHERE  mm.\`@type\`='Membership' AND ('Operator' IN mm.\`role\` OR mm.\`role\`='Operator') and '${query.day}' IN sch.has_day`;
		} else {
			let op_keys = _.castArray(query.operator_id);
			direct = `SELECT op.\`@id\` as operator, sch AS schedule FROM rdf op USE KEYS  ${JSON.stringify(op_keys)} JOIN rdf sch ON KEYS op.has_schedule.resource WHERE '${query.day}' IN sch.has_day`;
		}
		let req = {
			type: 'n1ql',
			key_depth: 1,
			query: {
				schedules: {
					direct
				}
			},
			final: function (query) {
				let templates = {};
				let reduced = _.reduce(query.schedules, (acc, val) => {
					acc[val.operator] = `${val.operator}-plan--${plan_id}`;
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
			query: req
		};
	},
	set: function (data) {
		let access = [];
		let opts = {};
		_.map(_.values(data), (val) => {
				let node = val;
				let cas = val.cas;
				_.unset(val, 'key');
				_.unset(val, 'cas');
				access.push(node);
				if (cas) {
					opts[node['@id']] = {
						cas
					};
				}
			})
			// console.log("SETTING OTPLAN", access, data);
		return {
			values: access,
			options: opts
		};
	}
};
