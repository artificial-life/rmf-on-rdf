'use strict'

class BasicCache {
	constructor() {

	}
	calculate(params) {
		throw new Error('BasicCache method, override this')
	}
}

module.exports = BasicCache;