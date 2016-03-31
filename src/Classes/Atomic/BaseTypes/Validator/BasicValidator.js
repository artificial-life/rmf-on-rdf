'use strict'

class BasicValidator {
	constructor(data) {
		this.content_map = data || {};
		this.validators = {
			default: (val) => !_.isUndefined(val)
		};
	}
	validator(key, validator) {
		this.validators[key] = validator;
	}
	validate() {
		return reduce(this.content_map, (acc, val, key) => {
			let result = _.isFunction(this.validators[key]) ? this.validators[key](val) : this.validators.default(val);
			return acc && result;
		}, true);
	}
}

module.exports = BasicValidator;