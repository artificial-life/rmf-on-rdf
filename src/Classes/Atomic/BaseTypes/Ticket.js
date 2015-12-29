'use strict'

class Ticket {
	constructor() {
			//no memory, no siblings, no regrets
			this.fields = ['id', 'source', 'time_description', 'operator', 'service', "code", "label", "destination", "booking_date", "dedicated_date", "priority", "state", "user_info", "service_count"];
			this.content_map = {};
			//@TODO validators?
		}
		//this should be somewhere else
	propertyKeyTransform(prop) {
		return "iris://vocabulary/domain#" + _.camelCase("has_" + prop);
	};

	build(data) {
		if(data.cas) {
			//construct from db
			this.cas = data.cas;
			//meh
			let db_data = data.value;
			this.content_map.id = db_data['@id'];

			_.map(this.fields, (property) => {
				let key = this.propertyKeyTransform(property);
				if(!_.isUndefined(db_data[key])) {
					let val = _.map(db_data[key], (piece) => {
						return piece['@id'] || piece['@value'];
					})
					this.content_map[property] = val[0];
				}
			});
			this.content_map.time_description = JSON.parse(this.content_map.time_description);
		} else {
			_.map(this.fields, (property) => {
				if(!_.isUndefined(data[property]))
					this.content_map[property] = data[property];
			});
		}
	}

	invalidate(fieldname) {
		this.content_map[fieldname] = undefined;
	}

	isValid() {
		return(this.fields.length == _.filter(_.values(this.content_map), (val) => {
			return !_.isUndefined(val)
		}).length);
	}

	observe() {
		return this;
	}
	reserve() {
		return this;
	}
	serialize() {
		let data = {};
		_.merge(data, this.content_map);
		data.time_description = JSON.stringify(data.time_description);
		return data;
	}
}

module.exports = Ticket;