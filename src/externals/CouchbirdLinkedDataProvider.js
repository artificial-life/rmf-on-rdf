'use strict'

let AbstractDataProvider = require('./AbstractDataProvider.js');

//it is naturally able to set/get multiple keys
//but now it is used only for single-key operations

class CouchbirdLinkedDataProvider extends AbstractDataProvider {
	constructor(bucket) {
		super();
		this._bucket = bucket;
	}
	get(keys, options) {
		return this._bucket.getNodes(keys, options);
		// .then((res) => {
		// 	return res[key];
		// });
	}

	//TODO: Interpreter stage
	set(values, options) {
		return this._bucket.replaceNodes(values, options);
		// .then((res) => {
		// 	return res[key];
		// });
	}

	//TODO: Interpreter stage
	upsert(values, options) {
		return this._bucket.upsertNodes(values, options);
		// .then((res) => {
		// 	return res[key];
		// });
	}

	//DESTROY
	remove(keys, options) {
		return this._bucket.removeNodes(keys, options);
		// .then((res) => {
		// 	return res[key];
		// });
	}
}

module.exports = CouchbirdLinkedDataProvider;