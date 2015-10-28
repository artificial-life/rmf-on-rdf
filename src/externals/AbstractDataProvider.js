'use strict'

class AbstractDataProvider {

    get(key) {
        throw new Error('AbstractDataProvider method');
    }
    set(key, value) {
        throw new Error('AbstractDataProvider method');
    }
    upsert(key, value) {
        throw new Error('AbstractDataProvider method');
    }
}

module.exports = AbstractDataProvider;