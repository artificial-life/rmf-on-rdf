'use strict'

var _ = require('lodash');

class AllIterator {
    constructor(map, path) {
        this.map = map;
        this.reset(path);

    }
    reset(map, path) {
        var keys = _.keys(this.tier(map, path));
        var gen = function* (array) {
            yield * array;
        }

        this.iterator = gen(keys);

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
    next() {
        return this.iterator.next()
    }
}



module.exports = AllIterator;