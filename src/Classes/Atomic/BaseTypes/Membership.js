'use strict'

let Fieldset = require("./Fieldset");

class Membership extends Fieldset {
	constructor() {
		let fields = ["organization", "member", "role"];
		super(fields);
	}
}

module.exports = Membership;