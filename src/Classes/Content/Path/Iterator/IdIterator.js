'use strict'

var BasicIterator = require('./BasicIterator.js');

class IdIterator extends BasicIterator {
    constructor(id) {
        super();
        this.data = id;
        this.reset();
    }
    reset() {
        this.done = false;
        return this;
    }
    next() {
        var done = this.done;

        this.done = true;

        return {
            value: done ? undefined : this.data,
            done: done
        }
    }
}



module.exports = IdIterator;