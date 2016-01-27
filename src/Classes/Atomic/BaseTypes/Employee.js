'use strict'

let Fieldset = require("./Fieldset");

class Employee extends Fieldset {
	constructor() {
		let fields = ["id", "phone", "first_name", "last_name", "middle_name", "login", "password", "provides", "has_schedule", "has_permission", "state", "default_workstation"];
		super(fields);
	}

	get references() {
		return ["provides", "has_schedule", "has_permission"];
	}
}

module.exports = Employee;