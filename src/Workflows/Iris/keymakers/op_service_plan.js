'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQ", query);
		if (!query)
			return {};
		if (query.operator_id == '*') {} else {
			let op_keys = _.castArray(query.operator_id);
		}
		let chain = [];
		let s_in_keys;
		let o_in_keys;
		let s_out_keys;
		let o_out_keys;
		let m_key = "global_membership_description";
		if (query.operator == '*') {
			chain.push({
				name: "mm",
				in_keys: [m_key]
			});
			o_out_keys = (md) => {
				let ops = _.map(_.filter(md[m_key].value.has_description, (mm) => (mm.role == "Operator" && mm.organization == query.organization)), "member");
				return _.flattenDeep(ops);
			};
		} else {
			o_in_keys = _.castArray(query.operator);
		}
		chain.push({
			name: "ops",
			in_keys: o_in_keys,
			out_keys: o_out_keys
		});
		if (query.service == '*') {
			s_out_keys = (ops) => {
				return _.uniq(_.flatMap(ops, "value.provides"));
			};
		} else {
			s_in_keys = _.castArray(query.service);
		}
		chain.push({
			name: "services",
			in_keys: s_in_keys,
			out_keys: s_out_keys
		});
		chain.push({
			name: "schedules",
			out_keys: (servs) => {
				let schedules = _.map(servs, `value.has_schedule.${query.method}`);
				return _.uniq(_.flattenDeep(schedules));
			}
		});
		let req = {
			type: 'chain',
			key_depth: 2,
			query: chain,
			final: function (res) {
				console.log("SPLAN QUERY", res);
				let srvs = _.keyBy(_.map(res.services, "value"), "@id");
				let reduced = _.reduce(res.ops, (acc, val) => {
					let key = val.value["@id"];
					acc[key] = _.reduce(val.value.provides, (s_acc, s_id) => {
						let sch = _.find(res.schedules, (sch) => {
							let sch_id = sch.value["@id"];
							console.log("SCH", sch_id);
							return !!~_.indexOf(_.castArray(srvs[s_id].has_schedule[query.method]), sch_id) && !!~_.indexOf(sch.value.has_day, query.day);
						}) || {};
						if (sch)
							s_acc[s_id] = sch.value;
						return s_acc;
					}, {});
					return acc;
				}, {});
				console.log("REDUCED SPLANS", reduced);
				return reduced;
			}
		};

		return {
			query: req
		};
	}
};
