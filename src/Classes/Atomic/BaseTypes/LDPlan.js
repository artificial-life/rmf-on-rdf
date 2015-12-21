'use strict'

var _ = require('lodash');

var TimeChunk = require('./Primitive/TimeChunk.js');
var Plan = require('./Plan.js');
var ZeroDimensional = require('./ZeroDimensionalVolume.js');

class LDPlan extends Plan {
	constructor(parent) {
		super(parent);
		this.PrimitiveVolume = TimeChunk;
	}

	build(data) {
		let item = data[0] || data;
		let build_data = item['iris://vocabulary/domain#hasTimeDescription'];
		if(item.cas) {
			this.cas = item.cas;
			item = item.value;
			build_data = item['iris://vocabulary/domain#hasTimeDescription'][0]['@value'];
			build_data = JSON.parse(build_data);
		}
		if(_.isUndefined(build_data))
			build_data = {
				data: [
					[0, 0]
				]
			};
		super.build(build_data);

		return Promise.resolve(this);
	}

	observe(...args) {
		console.log("LDP OBSERVE");
		super.observe(args);
	}
}

module.exports = LDPlan;