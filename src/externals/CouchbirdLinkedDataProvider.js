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
		return this._bucket.getNodes(key)
			.then((res) => {
				return res[key];
			});
	}

	//TODO: Interpreter stage
	set(key, value) {
		return this._bucket.replaceNodes(value)
			.then((res) => {
				return res[key];
			});
	}

	//TODO: Interpreter stage
	upsert(key, value) {
		return this._bucket.upsertNodes(value)
			.then((res) => {
				return res[key];
			});
	}

	//DESTROY
	remove(key) {
		return this._bucket.removeNodes(key)
			.then((res) => {
				return res[key];
			});
	}
}

module.exports = CouchbirdLinkedDataProvider;