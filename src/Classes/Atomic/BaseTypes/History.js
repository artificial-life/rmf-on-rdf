'use strict'

let Fieldset = require("./Fieldset");

class History extends Fieldset {
	constructor() {
		let fields = ["event_name", "time", "reason", "subject", "object", "local_time"];
		super(fields);
	}

	get references() {
		return ['subject', 'object'];
	}
}

module.exports = History;
