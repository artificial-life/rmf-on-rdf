'use strict'

class Fieldset {
	constructor(fields) {
		let props = _.concat(["id", "type", 'label', "short_label", "description"], fields);
		this.content_map = _.reduce(props, (acc, field) => {
			acc[field] = undefined;
			return acc;
		}, {});
	}

	get fields() {
		return _.keys(this.content_map);
	}

	build(data) {
		_.map(this.fields, (property) => {
			if (!_.isUndefined(data[property]))
				this.content_map[property] = data[property];
		});
		// console.log("BUILT FIELDSET", this.content_map, "FROM", data);
	}

	serialize() {
		let data = {};
		_.merge(data, this.content_map);
		return data;
	}
}

module.exports = Fieldset;
