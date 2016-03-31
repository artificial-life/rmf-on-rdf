'use strict'

var _ = require('lodash');

var ResolvedContentAsync = require('./ResolvedContentAsync.js');

class FactoryContentAsync extends ResolvedContentAsync {
	constructor(parent) {
		super(parent);
	}
	set length(value) {
		this.produced = 0;
	}
	get length() {
		return _.size(this.getAtom(['<namespace>builder', 'box']).content);
	}
}

module.exports = FactoryContentAsync;