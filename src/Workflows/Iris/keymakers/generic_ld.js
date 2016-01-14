'use strict'

function generic_ld(Model, finalizer = 'basic_ld') {
	// console.log("GENERIC LD KM", Model.name, finalizer);
	let fin_keymaker = require("./index")(finalizer);
	return {
		get: (data) => {
			let result = data;
			if(data.query) {
				let item = new Model();
				item.build(data.query);
				result.query = item.getAsQuery();
			}
			if(data.keys) {
				let item = new Model();
				let keys = _.isArray(data.keys) ? data.keys : [data.keys];
				result.keys = _.map(keys, key => {
					item.build({
						id: key
					});
					return item.getAsQuery()['@id'];
				});
			}
			return fin_keymaker.get(result);
		},
		set: (data) => {
			let items = _.isArray(data) ? data : [data];
			let result = _.map(items, (t_data) => {
				let item = new Model();
				item.build(t_data);
				return item.dbSerialize();
			});
			return fin_keymaker.set(result);
		}
	}
};

module.exports = generic_ld;