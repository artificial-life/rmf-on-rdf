'use strict'

let CommonApi = require("./CommonApi");

class AdminApi extends CommonApi {
	constructor() {
		super();
	}

	initContent() {
		return this;
	}

}

module.exports = AdminApi;