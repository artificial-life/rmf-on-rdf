'use strict'

let AbstractDataProvider = require('./AbstractDataProvider.js');

//it is naturally able to set/get multiple keys
//but now it is used only for single-key operations

class CouchbirdLinkedDataProvider extends AbstractDataProvider {
	constructor(bucket) {
		super();
		this._bucket = bucket;
	}
	get(key) {
		return this._bucket.getNodes(key);
	}

	//TODO: Interpreter stage
	set(key, value) {
		return this._bucket.replaceNodes(value);
	}

	//TODO: Interpreter stage
	upsert(key, value) {
		return this._bucket.upsertNodes(value);
	}

	//DESTROY
	remove(key) {
		return this._bucket.removeNodes(key);
	}
}

module.exports = CouchbirdLinkedDataProvider;