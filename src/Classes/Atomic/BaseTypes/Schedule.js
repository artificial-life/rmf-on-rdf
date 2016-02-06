'use strict'

let Fieldset = require("./Fieldset");

class Schedule extends Fieldset {
	constructor() {
		let fields = ['has_time_description', "has_day", "schedule_of"];
		super(fields);
	}

	get references() {
		return ["has_day", "schedule_of"];
	}
}

module.exports = Schedule;