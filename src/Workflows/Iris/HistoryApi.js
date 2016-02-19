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

	getEntry(query) {
		return super.getEntry('History', query);
	}
	setEntry(data) {
		return super.setEntry('History', data);
	}
}

module.exports = HistoryApi;
