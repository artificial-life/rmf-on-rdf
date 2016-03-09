'use strict'

let RDFcb = require("cbird-rdf")
	.RD;
let db = false;

class IrisApi {
	constructor() {
		this.db = db;
	}
	static init(bname) {
		if (bname) {
			let cbird = new RDFcb();
			db = cbird.bucket(bname);
		}
	}
	initContent() {
		throw new Error("Not implemented in ", this.constructor.name);
	}
	getContent() {
		throw new Error("Not implemented in ", this.constructor.name);
	}
}

module.exports = IrisApi;
