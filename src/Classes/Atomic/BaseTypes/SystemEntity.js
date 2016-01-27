'use strict'

let Fieldset = require("./Fieldset");

class SystemEntity extends Fieldset {
	constructor() {
		let fields = ["id", "login", "password", "has_permission", "state", "default_workstation"];
		super(fields);
	}
}

module.exports = SystemEntity;