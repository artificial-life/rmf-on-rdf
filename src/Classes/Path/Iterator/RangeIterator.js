'use strict'

var BasicIterator = require('./BasicIterator.js');

class RangeIterator extends BasicIterator {
    constructor(from, to) {
        super(function* (data) {
            var i;
            var to = data.to;
            var from = data.from;

            for (i = from; i <= to; i += 1) {
                yield i;
            }
        });

        this.data = {
            to: to,
            from: from
        };
        this.reset();
    }
    reset() {
        this.iterator = this.generator(this.data);
        return this;
    }
}



module.exports = RangeIterator;