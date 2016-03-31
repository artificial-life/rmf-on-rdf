'use strict'

let Fieldset = require("./Fieldset");

class SystemEntity extends Fieldset {
	constructor() {
		let fields = ["login", "password_hash", "permissions", "state", "default_workstation", "available_workstation"];
		super(fields);
	}
}

module.exports = SystemEntity;