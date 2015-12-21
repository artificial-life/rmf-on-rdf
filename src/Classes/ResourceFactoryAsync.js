'use strict'

var _ = require('lodash');

var ContentAsync = require('./ContentAsync.js');
var FactoryContentAsync = require('./FactoryContentAsync.js');

class FactoryAsync extends ContentAsync {
	constructor() {
		super(FactoryContentAsync);
	}
	build(params) { //@NOTE: that's specific to factory content
		//@TODO: rework  it when multiple selectors would be done
		this.selector().query_params = _.assign(this.selector().query_params, params);

		return this.resolve();
	}
}

module.exports = FactoryAsync;