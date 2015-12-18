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
		return Promise.resolve(this.data_provider.get(access_obj))
			.then((result) => {
				let final = _.transform(result, (res, val, key) => {
					res[key] = _.isUndefined(val) ? this.makeInitial(key) : val;
				});
				return Promise.props(final);
			});
	}

	template(fn) {
		if(fn) {
			return super.template(fn);
		}

		this.template_maker = function(context) {
			//cut off namespace
			let re = this.class_map.common_id;
			let type_info = {};
			//get & replace type
			let requested_access_obj = context;
			let access_obj = context.replace(re, (str, prefix, type, id) => {
				type_info = this.class_map.classes[type];
				if(_.isUndefined(type_info))
					return requested_access_obj;
				let template_type = type_info.template;
				return `${prefix}#${template_type}-${id}`;
			});

			//return key from data_provider
			return Promise.resolve(this.data_provider.get({
					keys: access_obj
				}))
				.then((found) => {
					let res = found[access_obj];
					if(_.isUndefined(res))
						return res;
					res = res.value;
					let result = {}


					if(!_.isUndefined(type_info.map_keys)) {
						result = _.mapKeys(res, (value, key) => {
							let newkey = type_info.map_keys[key];
							return _.isUndefined(newkey) ? key : newkey;
						});
					}
					if(!_.isUndefined(type_info.map_values)) {
						_.map(type_info.map_values, (mapper, key) => {
							result[key] = _.isFunction(mapper) ? mapper(res[key]) : mapper;
						});
					}

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