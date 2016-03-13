'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQR", query);
		if (!query)
			return {};
		let plan_id = _.isString(query.dedicated_date) ? dedicated_date : query.dedicated_date.format("YYYY-MM-DD");
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
				let schedules = _.map(ops, (op) => {
					if (!op) return [];
					let keys = _.castArray(op.value.has_schedule.resource);
					return _.concat(keys, `${op.value["@id"]}-${query.organization}-plan--${plan_id}`);
				});
				return _.uniq(_.flattenDeep(schedules));
			}
		});
		let req = {
			type: 'chain',
			key_depth: 1,
			query: chain,
			final: function (res) {
				// console.log("OPRESOURCFE", require('util')
				// 	.inspect(res, {
				// 		depth: null
				// 	}));
				let templates = {};
				let day = query.dedicated_date.format('dddd');
				let ops = _.keyBy(_.map(_.compact(res.ops), "value"), "@id");
				let schedules = _.keyBy(_.map(res.schedules, "value"), "@id");
				let reduced = _.reduce(ops, (acc, val, key) => {
					let sch = _.find(schedules, (sch, sch_id) => {
						return !!~_.indexOf(_.castArray(val.has_schedule.resource), sch_id) && !!~_.indexOf(sch.has_day, day);
					});
					if (sch) {
						acc[key] = {};
						let k = `${key}-${query.organization}-plan--${plan_id}`;
						acc[key][k] = schedules[k];
						templates[key] = sch;
					}
					return acc;
				}, {});
				// console.log("RES FIN RESOURCE", reduced, templates);
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
			values: {
				data: access
			},
			options: opts
		};
	}
};
