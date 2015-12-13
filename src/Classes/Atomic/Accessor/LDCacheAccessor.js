'use strict'

let _ = require('lodash');
let Promise = require('bluebird');
let CacheAccessor = require('./CacheAccessor.js');

class LDCacheAccessor extends CacheAccessor {
	constructor(data_provider) {
		super(data_provider);
	}
	mapper(map = {}) {
		this.class_map = map;
		this.template();
		return this;
	}
	get(context) {
		let access_obj = this.makeAccessObject('get', context);
		return Promise.resolve(this.data_provider.get(access_obj))
			.then((result) => {
				return _.isUndefined(result) ? this.makeInitial(context) : result;
			});
	}

	template(fn) {
		if(fn) {
			return super.template(fn);
		}

		this.template_maker = function(context) {
			//cut off namespace
			let prefix = this.class_map.prefix.data;
			let re = new RegExp(prefix + "#([^\/]*)-([^\/]*)");
			let type_info = {};
			//get & replace type
			let requested_access_obj = this.makeAccessObject('get', context);
			let access_obj = context.replace(re, (str, type, id) => {
				type_info = this.class_map.classes[type];
				let template_type = type_info.template;
				return `${prefix}#${template_type}-${id}`;
			});
			//return key from data_provider
			return Promise.resolve(this.data_provider.get(access_obj))
				.then((res) => {
					if(_.isUndefined(res))
						return res;

					let result = _.mapKeys(res.value, function(value, key) {
						let newkey = type_info.map_keys[key];
						return _.isUndefined(newkey) ? key : newkey;
					});

					if(!_.isUndefined(type_info.typecast))
						result["@type"] = [type_info.typecast];
					result["@id"] = requested_access_obj;

					return result;
				});
		};
		return this;
	}
}

module.exports = LDCacheAccessor;