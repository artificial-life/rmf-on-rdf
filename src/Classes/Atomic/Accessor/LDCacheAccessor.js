'use strict'

let _ = require('lodash');

let CacheAccessor = require('./CacheAccessor.js');

class LDCacheAccessor extends CacheAccessor {
	constructor(data_provider) {
		super(data_provider);
		this.keymaker('set').keymaker('get');
	}
	mapper(map = {}) {
		this.class_map = map;
		this.template();
		return this;
	}
	keymaker(type, fn) {
		if(fn) {
			return super.template(type, fn);
		}
		this.makers[type] = function(context) {
			return context;
		}
		return this;
	}
	template(fn) {
		if(fn) {
			return super.template(fn);
		}
		this.template_maker = function(context) {
			//cut off namespace
			let prefix = this.class_map.prefix;
			let re = new RegExp(prefix + "/([^\/]*)#([^\/]*)");
			//get & replace type
			let access_obj = context.replace(re, (str, type, id) => {
				let template_type = this.class_map.classes[type].template;
				return `${prefix}/${template_type}#${id}`;
			});
			//return key from data_provider
			return this.data_provider.get(access_obj);
		}
		return this;
	}
}

module.exports = LDCacheAccessor;