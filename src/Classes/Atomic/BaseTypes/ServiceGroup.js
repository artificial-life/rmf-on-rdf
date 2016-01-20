'use strict'

let Fieldset = require("./Fieldset");

class ServiceGroup extends Fieldset {
	constructor() {
		let fields = ["id", "service_group_name", "service_group_type", "service_group_label", "service_group_icon", "service_group_content"];
		super(fields);
	}
	get references() {
		return ['service_group_content'];
	}
}

module.exports = ServiceGroup;