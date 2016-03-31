'use strict'

var _ = require('lodash');

var AbstractAccessor = require('./AbstractAccessor.js');

class BasicAccessorAsync extends AbstractAccessor {
	get(context) {
		return super.get(context).then((status) => status);
	}
	set(data) {
		return super.set(data).then((status) => status);
	}
}

module.exports = BasicAccessorAsync;