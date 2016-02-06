'use strict'

let Fieldset = require("./Fieldset");

class Workstation extends Fieldset {
	constructor() {
		let fields = ["occupied_by", "default_agent", "attached_to", "device_sound", "device_design", "device_type"];
		super(fields);
	}
	get references() {
		return ['occupied_by', 'attached_to', 'default_agent', 'allows_role'];
	}
}

module.exports = Workstation;