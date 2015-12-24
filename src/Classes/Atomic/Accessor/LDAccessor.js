'use strict'

let BasicAccessorAsync = require('./BasicAccessorAsync.js');

class LDAccessor extends BasicAccessorAsync {
	constructor(data_provider) {
		super(data_provider);
	}
	set(data) {
		let access_obj = this.makeAccessObject('set', data);
		return this.data_provider.upsert(access_obj);
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