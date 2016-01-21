'use strict'

let Fieldset = require("./Fieldset");

class History extends Fieldset {
	constructor() {
		let fields = ["id", "entry"];
		super(fields);
	}
}

module.exports = History;