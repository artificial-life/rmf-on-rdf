'use strict'

let Fieldset = require("./Fieldset");

class Organization extends Fieldset {
	constructor() {
		let fields = ["pin_code_prefix", "provides", "has_schedule", "has_unit", "unit_of", "org_timezone", "booking_methods", "prebook_expiration_interval", "prebook_show_interval", "prebook_label_prefix", "prebook_observe_offset"];
		super(fields);
	}

	get references() {
		return ["provides", "has_schedule", "has_unit", "unit_of"];
	}
}

module.exports = Organization;
