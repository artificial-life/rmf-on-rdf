'use strict'

let Fieldset = require("./Fieldset");

class UserInfo extends Fieldset {
	constructor() {
		let fields = ["id", "phone", "first_name", "last_name", "middle_name"];
		super(fields);
	}
}

module.exports = UserInfo;