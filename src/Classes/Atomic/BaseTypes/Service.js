'use strict'

let Fieldset = require("./Fieldset");

class Service extends Fieldset {
	constructor() {
		let fields = ["live_operation_time", "prebook_operation_time",
			"prebook_interval", "priority", "ordering", "prebook_percentage", "prebook_today_percentage", "code_frgu", "dept_code_frgu",
			"service_code_epgu", "has_status", "prebook_offset", "has_group", "prefix", "custom_fields", "has_schedule"
		];
		super(fields);
	}
	get references() {
		return ['has_status', 'has_group', "has_schedule"];
	}
}

module.exports = Service;
