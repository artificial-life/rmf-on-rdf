'use strict'

let Fieldset = require("./Fieldset");

class ServiceGroup extends Fieldset {
	constructor() {
		let fields = ["id", "service_group_order", "service_group_view_name", "service_group_label", "service_group_description", "service_group_icon", "service_group_content", "items_per_page"];
		super(fields);
	}
	get references() {
		return ['service_group_content'];
	}
}

module.exports = ServiceGroup;