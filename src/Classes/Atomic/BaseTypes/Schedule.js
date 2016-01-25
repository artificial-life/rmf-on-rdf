'use strict'

let Fieldset = require("./Fieldset");

class Schedule extends Fieldset {
	constructor() {
		let fields = ['id', 'has_time_description', "has_day", "schedule_of"];
		super(fields);
	}

	build(data) {
		super.build(data);
		if((data.value) || _.isString(this.content_map.has_time_description))
			this.content_map.has_time_description = JSON.parse(this.content_map.has_time_description);
		let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		this.content_map.has_day_code = _.map(this.content_map.has_day, (val) => {
			return _.last(val.split("#"));
		});
	}

	get references() {
		return ["has_day", "schedule_of"];
	}
	dbSerialize(data) {
		let node = data;
		//time description
		node["iris://vocabulary/domain#hasTimeDescription"] = [{
			"@value": JSON.stringify(this.content_map.has_time_description)
		}];
		return node;
	}


}

module.exports = Schedule;