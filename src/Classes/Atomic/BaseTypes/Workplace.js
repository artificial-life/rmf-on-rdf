'use strict'

let Determinable = require("./Determinable");

class Workplace extends Determinable {
	constructor(validator_model) {
		let fields = ["id", "occupied_by", "device_of", "attached_to", "device_sound", "device_design", "allows_role"];
		super(fields, validator_model);
		this.setKeyTransform((prop) => {
			return "iris://vocabulary/domain#" + _.camelCase(prop);
		});
	}
	dbSerialize() {
		let node = super.dbSerialize();
		//refs
		let refs = ['occupied_by', 'attached_to', 'device_of', 'allows_role'];
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

module.exports = Workplace;