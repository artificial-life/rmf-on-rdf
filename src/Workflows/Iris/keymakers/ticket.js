'use strict'

let delimiter = '--';
let basic = require("./index")('basic');
let makeKey = (org, dedicated_date) => {
	let dd = _.isString(dedicated_date) ? dedicated_date : dedicated_date.format("YYYY-MM-DD");
	return `ticket-${org}-${dd}`;
};

module.exports = {
	get: function ({
		query,
		keys
	}) {
		// console.log("QQT", query, keys);
		if (keys && !query)
			return {
				keys
			};

		if (!query)
			return {};

		_.unset(query, "@id");
		//limbo starts here
		if (query.dedicated_date) {
			let chain = [];
			let key = makeKey(query.org_destination, query.dedicated_date);
			let c_key = `counter-${key}`;
			// console.log("CKEY", c_key);
			chain.push({
				name: "counter",
				in_keys: [c_key]
			});
			chain.push({
				name: "tickets",
				out_keys: (max) => {
					let nums = _.get(max, `${c_key}.value`, 0) + 1;
					// console.log("TICKS", _.map(_.range(nums), (num) => `${key}${delimiter}${num}`));
					return _.map(_.range(nums), (num) => `${key}${delimiter}${num}`);
				}
			});
			let req = {
				type: 'chain',
				query: chain,
				final: function (res) {
					// console.log(":FOUND TICKS", res);
					_.unset(query, 'dedicated_date');
					let filtered = _.filter(_.map(_.compact(res.tickets), "value"), (tick) => {
						return _.reduce(query, (acc, val, key) => {
							let res = true;
							if (!_.isPlainObject(val)) {
								//OR
								res = !_.isEmpty(_.intersection(_.castArray(val), _.castArray(tick[key])));
							} else {
								res = _.isEqual(val, tick[key]);
							}
							return res && acc;
						}, true);
					});
					let keyed = _.keyBy(filtered, "@id");
					// console.log("REDUCED TICKS", keyed);
					return keyed;
				}
			};
			return {
				query: req
			};
		} else {
			return basic.get({
				query
			});
		}
	},
	set: (data) => {
		if (_.every(data, (d) => !_.isUndefined(d["@id"])))
			return basic.set(data);
		let access = _.map(data, (entity) => {
			_.unset(entity, 'cas');
			let dedicated_date = _.isString(entity.dedicated_date) ? entity.dedicated_date : entity.dedicated_date.format("YYYY-MM-DD");
			entity.dedicated_date = dedicated_date;
			entity["@id"] = makeKey(entity.org_destination, dedicated_date);
			return entity;
		});
		// console.log("SETTING TICK", access);
		return {
			type: 'counter',
			delimiter,
			counter_options: {
				initial: 0
			},
			data: access
		};
	}
};
