'use strict'

let Fieldset = require("./Fieldset");

class SystemEntity extends Fieldset {
	constructor() {
		let fields = ["id", "login", "password", "has_permission", "state", "bound_service_groups", "default_workstation"];
		super(fields);
	}
}

module.exports = SystemEntity;