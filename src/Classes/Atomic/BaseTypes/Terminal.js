'use strict'

let Fieldset = require("./Fieldset");

class Terminal extends Fieldset {
	constructor() {
		let fields = ["id", "default_agent", 'attached_to', "device_type", "device_label"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent'];
	}
}

module.exports = Terminal;