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
		let deep = 0;
		access_obj = _.assign(access_obj, this.makeAccessObject('get', context));

		if(access_obj.query) {
			deep = access_obj.query.key_depth;
		}
		// let tm = Date.now();

		return Promise.resolve(this.data_provider.get(access_obj))
			.then((result) => {
				// console.log("LDCA", result);
				let check = (data, depth) => {
					if(depth > 0) {
						return Promise.props(_.transform(data, (res, val, key) => {
							res[key] = check(val, depth - 1);
						}));
					} else {
						return Promise.all(_.map(data, (val, key) => {
							// console.log(key, Date.now() - tm);
							return(_.isUndefined(val) ? this.makeInitial(key) : val);
						}));
					}
				};
				return check(result, deep);
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
			//@TODO this is the same code as in KeymakerUtil
			let access_obj = context.replace(re, (str, prefix, type, id) => {
				type_info = this.class_map.classes[type];
				if(_.isUndefined(type_info))
					return requested_access_obj;
				let template = type_info.template;
				return `${template.prefix || prefix}#${template.type(type)}-${template.id(id)}`;
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