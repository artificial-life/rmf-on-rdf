'use strict'

let Fieldset = require("./Fieldset");

class Ticket extends Fieldset {
	constructor() {
		let fields = ['source', 'time_description', 'operator', 'alt_operator', 'service', "code", "destination", "booking_date", "dedicated_date", "priority", "state", "user_info", "service_count", "expires"];
		super(fields);
	}

	build(data) {
		super.build(data);
		if ((data.value) || _.isString(this.content_map.service_count))
			this.content_map.service_count = _.parseInt(this.content_map.service_count);
	}

	get references() {
		return ['service', 'operator', 'alt_operator', 'destination', 'source'];
	}

}

module.exports = Ticket;
