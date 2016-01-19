'use strict'

let Fieldset = require("./Fieldset");

class Workstation extends Fieldset {
	constructor() {
		let fields = ["id", "occupied_by", "default_employee", "attached_to", "device_sound", "device_design", "allows_role", "device_type", "device_label"];
		super(fields);
	}
	get references() {
		return ['occupied_by', 'attached_to', 'device_of', 'allows_role'];
	}
}

module.exports = Workstation;