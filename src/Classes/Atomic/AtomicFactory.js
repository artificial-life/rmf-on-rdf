'use strict'

var discover = require('./type-discover.js');

class AtomicFactory {
	constructor() {
		throw new DogeError({
			so: 'Singletone',
			such: 'unique'
		});
	}
	static create(type, params) {
		var atomicModel = discover.atomic(type);
		var dataModel = discover.dataType(params.type);

		var atomic = new atomicModel(dataModel, params.accessor);
		atomic.model_decription = params.type;
		return atomic;
	}
}

module.exports = AtomicFactory;
