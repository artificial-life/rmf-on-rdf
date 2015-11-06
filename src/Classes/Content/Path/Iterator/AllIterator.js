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
        var keys = _.keys(_.get(this.map, path));
        this.iterator = this.generator(keys);
        return this;
    }
}


module.exports = AllIterator;