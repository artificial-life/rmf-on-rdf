'use strict'

let CommonApi = require("./CommonApi");

class HistoryApi extends CommonApi {
	constructor() {
		super();
	}

	initContent() {
		super.initContent('History');
		return this;
	}

	makeEntry(data) {
		let Model = this.models['History'];
		let entry = new Model();
		entry.build(data);
		return entry.serialize();
	}

	getEntry(query) {
		return super.getEntry('History', query);
	}

	setEntry(data) {
		return super.setEntry('History', data);
	}
}

module.exports = HistoryApi;
