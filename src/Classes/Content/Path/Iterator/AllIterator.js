'use strict'

var _ = require('lodash');

var BasicIterator = require('./BasicIterator.js');

class AllIterator extends BasicIterator {
    constructor(map, path = []) {
        super(function* (array) {
            yield * array;
        });

        this.map = map;
        this.reset(path);
    }
    reset(path) {
        var keys = _.keys(this.tier(path));
        this.iterator = this.generator(keys);
        return this;
    }
    tier(parts) {
        var rv;
        var index;

        for (rv = this.map, index = 0; rv && index < parts.length; index += 1) {
            rv = rv[parts[index]];
        }

        return rv;
    }
}


module.exports = AllIterator;