'use strict'

let Fieldset = require("./Fieldset");

class Schedule extends Fieldset {
	constructor() {
		let fields = ['has_time_description', "has_day"];
		super(fields);
	}

	get references() {
		return ["has_day", "has_owner"];
	}

	build(data) {
		super.build(data);
		this.content_map.has_time_description = _.castArray(data.has_time_description);
	}
}

module.exports = Schedule;
