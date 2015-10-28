'use strict'

var TEST_STORAGE = require('./TESTSTORAGE.js');

var AbstractDataProvider = require('./AbstractDataProvider.js');

class HashmapDataProvider extends AbstractDataProvider {
    get(key) {
        if (!TEST_STORAGE.hasOwnProperty(key)) throw new Error('No such key');
        return TEST_STORAGE[key];
    }
    set(key, value) {
        if (!TEST_STORAGE.hasOwnProperty(key)) throw new Error('No such key');
        TEST_STORAGE[key] = value;
        return true;
    }
    upsert(key, value) {
        TEST_STORAGE[key] = value;
        return true;
    }
}

module.exports = HashmapDataProvider;