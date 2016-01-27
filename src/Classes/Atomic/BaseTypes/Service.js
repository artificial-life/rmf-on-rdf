'use strict'

let Fieldset = require("./Fieldset");

class Service extends Fieldset {
	constructor() {
		let fields = ["id", "service_label", "service_description", "live_operation_time", "prebook_operation_time",
			"prebook_interval", "priority", "order", "prebook_percentage", "prebook_today_percentage", "code_frgu", "dept_code_frgu",
			"service_code_epgu", "has_status", "has_provider", "has_group", "prefix", "custom_fields"
		];
		super(fields);
	}
	get references() {
		return ['has_status', 'has_provider', 'has_group'];
	}
}

module.exports = Service;