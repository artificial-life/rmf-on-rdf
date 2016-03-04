'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQO", query);
		if (!query)
			return {};
		let plan_id = query.date;
		let chain = [];
		let in_keys;
		let out_keys;
		let m_key = "global_membership_description";
		if (query.operator == '*') {
			chain.push({
				name: "mm",
				in_keys: [m_key]
			});
			out_keys = (md) => {
				let ops = _.map(_.filter(md[m_key].value.has_description, (mm) => (mm.role == "Operator" && mm.organization == query.organization)), "member");
				return _.uniq(_.flattenDeep(ops));
			};
		} else {
			in_keys = _.castArray(query.operator);
		}
		chain.push({
			name: "ops",
			in_keys,
			out_keys
		});
		chain.push({
			name: "schedules",
			out_keys: (ops) => {
				console.log("OPS", ops);
				let schedules = _.map(ops, `value.has_schedule.${query.method}`);
				return _.uniq(_.flattenDeep(schedules));
			}
		});
		let req = {
			type: 'chain',
			key_depth: 1,
			query: chain,
			final: function (res) {
				let templates = {};
				console.log("RES FIN Q", require("util")
					.inspect(res, {
						depth: null
					}));
				let reduced = _.reduce(res.ops, (acc, val, key) => {
					let key = val.value["@id"];
					let sch = = _.find(res.schedules, (sch) => {
						let sch_id = sch.value["@id"];
						return !!~_.indexOf(_.castArray(val.value.has_schedule.resource), sch_id) && !!~_.indexOf(sch.value.has_day, query.day);
					});
					if (sch) {
						acc[key] = `${key}-plan--${plan_id}`;
						templates[key] = sch.value;
					}
					return acc;
				}, {});
				console.log("RES FIN ", reduced);
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
				delete val.key;
				delete val.cas;
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
