'use strict'

class AbstractAccessor {
	constructor(data_provider) {
		this.data_provider = data_provider;
		this.makers = {};
	}
	keymaker(type, fn) {
		this.makers[type] = fn;
		return this;
	}
	makeAccessObject(type, context) {
		if(!this.makers.hasOwnProperty(type)) throw new Error('No such maker: ' + type);

		var maker = this.makers[type];

		return maker instanceof Function ? maker(context) : maker;
	}
	get(context) {
		var access_obj = this.makeAccessObject('get', context);
		return this.data_provider.get(access_obj);
	}
	set(data) {
		var access_obj = this.makeAccessObject('set', data);

		return this.data_provider.set(access_obj, data);
	}
	upsert(data) {
		var method = this.makers.hasOwnProperty('upsert') ? 'upsert' : 'set';

		var access_obj = this.makeAccessObject(method, data);

		return this.data_provider.upsert(access_obj, data);
	}
}

module.exports = AbstractAccessor;