'use strict'

let BasicAccessorAsync = require('./BasicAccessorAsync.js');

class LDAccessor extends BasicAccessorAsync {
	constructor(data_provider) {
		super(data_provider);
	}
	set(data) {
		let access_obj = this.makeAccessObject('set', data);
		let values = [];
		let opts = {};
		if(access_obj.options && access_obj.values) {
			values = access_obj.values;
			opts = access_obj.options;
		} else {
			values = access_obj;
			opts = {};
		}
		return this.data_provider.upsert(values, opts);
	}
	get(context) {
		let access_obj = {
			options: context.options || {}
		};
		if(context.query) {
			access_obj.query = this.makeAccessObject('get', context.query);
		}
		if(context.keys) {
			let keys = _.isArray(context.keys) ? context.keys : [context.keys];
			access_obj.keys = _.map(keys, (key) => {
				return this.makeAccessObject('get', key);
			});
		}
		// let tm = Date.now();

		return Promise.resolve(this.data_provider.get(access_obj));
	}

}

module.exports = LDAccessor;