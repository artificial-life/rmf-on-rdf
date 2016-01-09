'use strict'

class Fieldset {
	constructor(fields) {
		this.content_map = _.reduce(fields, (acc, field) => {
			acc[field] = undefined;
			return acc;
		}, {});
	}

	get fields() {
		return _.keys(this.content_map);
	}

	build(data) {
		_.map(this.fields, (property) => {
			if(!_.isUndefined(data[property]))
				this.content_map[property] = data[property];
		});
	}
	serialize() {
		let data = {};
		_.merge(data, this.content_map);
		return data;
	}
}

module.exports = Fieldset;