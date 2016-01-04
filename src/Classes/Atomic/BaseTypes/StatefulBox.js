'use strict'

var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');
var Box = require('./Box.js');

class StatefulBox extends Box {
	constructor(models, hash_id) {
		super(models, hash_id);

		if(this.constructor.name == 'StatefulBox') return ProxifyCollection(this);
	}

	build(items) {
		this.content = _.reduce(this.collection_type, (result, Model, index) => {
			let obj = items[index];
			if(!(obj instanceof Model)) {
				obj = new Model();
				obj.build(items[index]);
			}
			result[index] = obj;
			return result;
		}, {});
		return this;
	}
	collectionMethod(method_name, passed) {
		let result = super.collectionMethod(method_name, passed);
		return result;
	}
	reserve(params) {
		//@TODO it might be that it is worth to rework collectionMethod
		// depends on how much 'exclusive' methods Box will need to hack into process
		var p = {};

		p[this.collection_id] = _.keys(this.collection_type);
		p.selection =
			_.reduce(p[this.collection_id], (acc, val) => {
				acc[val] = undefined;
				return acc;
			}, {});

		return this.reserve(p);
	}
	serialize() {
		let res = _.reduce(this.content, (result, item, key) => {
			let data = item.serialize();
			data.key = key;
			result[key] = data;
			return result;
		}, {});
		return res;
	}

	valid() {
		return _.reduce(this.content, (acc, val, key) => {
			return acc && val.valid();
		}, true);
	}
}

module.exports = StatefulBox;