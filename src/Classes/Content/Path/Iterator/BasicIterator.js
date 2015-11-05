'use strict'

class BasicIterator {
    constructor(generator) {
        this.generator = generator;
    }
    reset(...args) {
        this.iterator = this.generator(...args);
        return this;
    }
    next() {
        return this.iterator.next()
    }
}

module.exports = BasicIterator;