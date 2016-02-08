'use strict'

let Fieldset = require("./Fieldset");

class Schedule extends Fieldset {
	constructor() {
		let fields = ['has_time_description', "has_day", "has_owner"];
		super(fields);
	}

	get references() {
		return ["has_day", "has_owner"];
	}
}

module.exports = Schedule;