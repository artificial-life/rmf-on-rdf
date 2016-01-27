'use strict'

let Fieldset = require("./Fieldset");

class Terminal extends Fieldset {
	constructor() {
		let fields = ["id", "default_agent", 'attached_to', "device_type", "device_label", "bound_service_groups", "occupied_by"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent', "bound_service_groups", "occupied_by"];
	}
}

module.exports = Terminal;