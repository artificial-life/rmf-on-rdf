'use strict'

let Determinable = require("./Determinable");

class Ticket extends Determinable {
	constructor(validator_model) {
		//no memory, no siblings, no regrets
		let fields = ['id', 'source', 'time_description', 'operator', 'alt_operator', 'service', "code", "label", "destination", "booking_date", "dedicated_date", "priority", "state", "user_info", "service_count"];
		super(fields, validator_model);
	}

	build(data) {
		super.build(data);
		if((data.value) || _.isString(this.content_map.time_description))
			this.content_map.time_description = JSON.parse(this.content_map.time_description);
	}

	get references() {
		return ['service', 'operator', 'alt_operator', 'destination', 'source'];
	}
	dbSerialize(data) {
		let node = data;
		//time description
		node["iris://vocabulary/domain#hasTimeDescription"] = [{
			"@value": JSON.stringify(this.content_map.time_description)
		}];
		return node;
	}

}

module.exports = Ticket;