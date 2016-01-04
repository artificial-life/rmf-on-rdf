'use strict'

let Determinable = require("./Determinable");

class Ticket extends Determinable {
	constructor(validator_model) {
		//no memory, no siblings, no regrets
		let fields = ['id', 'source', 'time_description', 'operator', 'alt_operator', 'service', "code", "label", "destination", "booking_date", "dedicated_date", "priority", "state", "user_info", "service_count"];
		super(fields, validator_model);
		//@TODO validators?
		this.setKeyTransform((prop) => {
			return "iris://vocabulary/domain#" + _.camelCase("has_" + prop);
		});
	}

	build(data) {
		super.build(data);
		if((data.value) || _.isString(this.content_map.time_description))
			this.content_map.time_description = JSON.parse(this.content_map.time_description);
	}

	invalidate(fieldname) {
		this.content_map[fieldname] = undefined;
	}

	dbSerialize() {
		let node = super.dbSerialize();
		//refs
		let refs = ['service', 'operator', 'alt_operator', 'destination', 'source'];
		_.map(refs, (ref) => {
				let key = this.keyTransform(ref);
				let ref_val = _.isArray(this.content_map[ref]) ? this.content_map[ref] : [this.content_map[ref]];
				let value = _.map(ref_val, (val) => {
					return _.isUndefined(val) ? false : {
						'@id': val
					};
				});
				node[key] = _.compact(value);
			})
			//time description
		node["iris://vocabulary/domain#hasTimeDescription"] = [{
			"@value": JSON.stringify(this.content_map.time_description)
		}];
		return node;
	}
	getAsQuery() {
		let data = super.dbSerialize();
		return _.reduce(data, (acc, val, key) => {
			if(!_.isUndefined(val)) acc[key] = val;
			return acc;
		}, {});
	}

}

module.exports = Ticket;