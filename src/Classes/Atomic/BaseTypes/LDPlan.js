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
		let item = data[0];
		if(data.cas) {
			this.cas = data.cas;
			item = data.value;
		}
		let build_data = item['iris://vocabulary/domain#hasTimeDescription'];
		super.build(build_data);
		return Promise.resolve(this);
	}
}

module.exports = LDPlan;