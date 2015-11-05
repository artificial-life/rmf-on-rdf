'use strict'

var _ = require('lodash');

var discover = {
    module_cache: {},
    Iterator: function (name) {
        var fullname = _.capitalize(name);
        var fullpath = `./Iterator/${fullname}Iterator.js`;

        if (!this.module_cache.hasOwnProperty(fullpath)) {
            this.module_cache[fullpath] = require(fullpath);
        }

        return this.module_cache[fullpath];
    }
};


class Selector {
    constructor(collection) {
        this.collection = collection;
        this.reset();
    }
    all() {
        return this.addIterator('all', this.collection);
    }
    list(array) {
        return this.addIterator('array', array);
    }
    range(from, to) {
        return this.addIterator('range', from, to);
    }
    id(data) {
        return this.addIterator('Id', data);
    }
    addIterator(name, ...args) {
        var IteratorModel = discover.Iterator(name);
        this.chain.push(new IteratorModel(...args));

        return this;
    }
    reset() {
        this.chain = [];
        return this;
    }
    getChain() {
        return this.chain;
    }
    makeInitial() {
        var keys = [];

        _.forEach(this.chain, (iterator, index) => {
            if (iterator instanceof discover.Iterator('all')) iterator.reset(keys);
            keys.push(index != this.chain.length - 1 ? iterator.next().value : undefined);
        });

        return keys;
    }
}

module.exports = Selector;