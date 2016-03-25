'use strict'

let Fieldset = require("./Fieldset");

class QaMobile extends Fieldset {
	constructor() {
		let fields = ["default_agent", 'attached_to', "device_type", "occupied_by", "questions", "answers"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent'];
	}
}

module.exports = QaMobile;
