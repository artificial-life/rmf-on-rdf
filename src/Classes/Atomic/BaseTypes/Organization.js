'use strict'

let Fieldset = require("./Fieldset");

class Organization extends Fieldset {
	constructor() {
		let fields = ["id", "pin_code_prefix", "provides", "has_schedule", "has_unit", "unit_of", "org_label", "org_timezone"];
		super(fields);
	}

	get references() {
		return ["provides", "has_schedule", "has_unit", "unit_of"];
	}
}

module.exports = Organization;