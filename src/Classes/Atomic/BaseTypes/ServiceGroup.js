'use strict'

let Fieldset = require("./Fieldset");

class ServiceGroup extends Fieldset {
	constructor() {
		let fields = ["view_order", "view_name", "icon", "content", "items_per_page"];
		super(fields);
	}
	get references() {
		return ['content'];
	}
}

module.exports = ServiceGroup;