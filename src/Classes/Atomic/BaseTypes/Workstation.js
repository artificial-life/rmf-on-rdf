'use strict'

let Fieldset = require("./Fieldset");

class Workstation extends Fieldset {
	constructor() {
		let fields = ["occupied_by", "provides", "has_schedule", "default_agent", "attached_to", "device_sound", "device_design", "device_type", "digital_display_address"];
		super(fields);
	}
	get references() {
		return ['occupied_by', 'attached_to', 'default_agent', 'allows_role'];
	}
}

module.exports = Workstation;
