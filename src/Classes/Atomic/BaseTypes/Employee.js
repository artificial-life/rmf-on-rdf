'use strict'

let Fieldset = require("./Fieldset");

class Employee extends Fieldset {
	constructor() {
		let fields = ["id", "phone", "first_name", "last_name", "middle_name", "login", "password", "provides", "has_membership", "has_schedule", "has_permission"];
		super(fields);
	}
}

module.exports = Employee;