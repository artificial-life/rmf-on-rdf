'use strict'

let Fieldset = require("./Fieldset");

class Service extends Fieldset {
	constructor() {
		let fields = ["id"];
		super(fields);
	}
}

module.exports = Service;