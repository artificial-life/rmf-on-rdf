'use strict'

var BasicIterator = require('./BasicIterator.js');

class ArrayIterator extends BasicIterator {
    constructor(array) {
        super(function* (array) {
            yield * array;
        });

        this.data = array;
        this.reset();
    }
    reset() {
        this.iterator = this.generator(this.data);
        return this;
    }
}



module.exports = ArrayIterator;