'use strict'

let _ = require('lodash');
let Promise = require('bluebird');
let CacheAccessor = require('./CacheAccessor.js');

class LDCacheAccessor extends CacheAccessor {
	constructor(data_provider) {
		super(data_provider);
		this.template(function (key, template) {
			template['@id'] = key;
			return template;
		});
	}
	makeInitial(...context) {
		if (!this.template_maker) throw new Error('template is not defined');

		return this.template_maker.apply(this, context);
	}
	set(data) {
		let access_obj = this.makeAccessObject('set', data);
		let values = [];
		let opts = {};
		if (access_obj.options && access_obj.values) {
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
		let deep = 0;
		access_obj = _.assign(access_obj, this.makeAccessObject('get', context));

		if (access_obj.query) {
			deep = access_obj.query.key_depth;
		}
		// let tm = Date.now();

		return Promise.resolve(this.data_provider.get(access_obj))
			.then((result) => {
				return _.mergeWith(result.templates, result.keys, (objValue, srcValue, key) => {
					if (objValue['@id']) {
						let [k, v] = _.toPairs(srcValue)[0];
						return v || this.makeInitial(k, objValue);
					}
				});
			});
	}

}

module.exports = LDCacheAccessor;
