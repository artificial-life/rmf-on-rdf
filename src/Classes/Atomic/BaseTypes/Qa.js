'use strict'

let Fieldset = require("./Fieldset");

class Qa extends Fieldset {
	constructor() {
		let fields = ["default_agent", 'attached_to', "device_type", "hold_screen_design"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent'];
	}
}

module.exports = Qa;
