'use strict'

class Ticket {
	constructor() {
		//no memory, no siblings, no regrets
		this.fields = ['time_description', 'operator', 'service', "code", "label", "destination", "booking_date", "dedicated_date", "priority", "state", "user_info", "service_count"];
		this.content_map = {};
		//@TODO validators?
	}

	build(data) {
		_.map(this.fields, (property) => {
			if(!_.isUndefined(data[property]))
				this.content_map[property] = data[property];
		});
	}

	invalidate(fieldname) {
		this.content_map[fieldname] = undefined;
	}

	isValid() {
		return(this.fields.length == _.compact(_.values(this.content_map)).length);
	}

	observe() {
		return this;
	}
	reserve() {
		return this;
	}
	serialize() {
		return this.content_map;
	}
}

module.exports = Ticket;