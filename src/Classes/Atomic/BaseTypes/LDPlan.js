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

}

module.exports = LDPlan;