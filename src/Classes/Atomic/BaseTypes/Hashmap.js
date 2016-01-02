'use strict'

var _ = require('lodash');

// var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');
var ProxifyCollection = require('../../../externals/Proxify/Collection.js');
var BaseCollection = require('./BaseCollection.js');

class Hashmap extends BaseCollection {
	constructor(models, hash_id) {
		super(models, hash_id);
		this.collection_type = _.reduce(this.collection_type, (result, model) => {
			result[model.name.toLowerCase()] = model;
			return result;
		}, {});

		if(this.constructor.name == 'Hashmap') return ProxifyCollection(this);
	}
	build(items) {
		this.content = _.reduce(this.collection_type, (result, Model, index) => {
			let obj = new Model();
			obj.build(items[index]);

			result[index] = obj;
			return result;
		}, {});
		return this;
	}
	observe(params) {
		var p = {};
		//@HACK: temporary
		p[this.collection_id] = _.keys(this.collection_type);
		p.selection = params;

		return this.observe(p);
	}
}

module.exports = Hashmap;