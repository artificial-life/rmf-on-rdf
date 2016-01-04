'use strict'

let Determinable = require("./Determinable");

class UserInfo extends Determinable {
	constructor(validator_model) {
		let fields = ["id", "phone", "first_name", "last_name", "middle_name"];
		super(fields, validator_model);
		this.setKeyTransform((prop) => {
			return "iris://vocabulary/domain#" + _.camelCase(prop);
		});
	}
}

module.exports = UserInfo;