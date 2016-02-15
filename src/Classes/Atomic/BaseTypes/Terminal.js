'use strict'

let Fieldset = require("./Fieldset");

class Terminal extends Fieldset {
	constructor() {
		let fields = ["default_agent", 'attached_to', "device_type", "bound_service_groups", "occupied_by", "prebook_state", "booking_methods", "reload_interval"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent', "bound_service_groups", "occupied_by"];
	}
}

module.exports = Terminal;
