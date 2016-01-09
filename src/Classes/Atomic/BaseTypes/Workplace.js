'use strict'

let Fieldset = require("./Fieldset");

class Workplace extends Fieldset {
	constructor() {
		let fields = ["id", "occupied_by", "device_of", "attached_to", "device_sound", "device_design", "allows_role"];
		super(fields);
	}
	get references() {
		return ['occupied_by', 'attached_to', 'device_of', 'allows_role'];
	}
}

module.exports = Workplace;