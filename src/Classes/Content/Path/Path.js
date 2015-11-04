'use strict'

var _ = require('lodash');
var AllIterator = require('./Iterator/AllIterator.js');


class Path {
    constructor(collection) {
        this.collection = collection;

    }
    selector(data) {
        var parts = data.split(' ');
        this.keys = [];
        this.is_done = false;

        this.chain = _.map(parts, (part, index) => {
            var iterator = new AllIterator(this.collection, this.keys);

            var value = index != parts.length - 1 ? iterator.next().value : undefined;

            this.keys.push(value);

            return iterator;
        });

        return this;
    }
    next() {
        if (this.is_done) return {
            done: true
        };

        return this.stepBack(this.keys.length);
    }
    stepAhead(index) {
        if (index == this.chain.length - 1) {
            return {
                value: this.keys,
                done: false
            };
        }

        var pos = index + 1;

        var init = this.keys.slice(0, pos - this.keys.length);
        this.chain[pos].reset(init);

        var result = this.chain[pos].next();
        this.keys[pos] = result.value;

        return result.done ? this.stepBack(pos) : this.stepAhead(pos);
    }
    stepBack(index) {
        if (index == 0) {
            this.is_done = true;
            return {
                done: true
            };
        }

        var pos = index - 1;

        var result = this.chain[pos].next();
        this.keys[pos] = result.value;

        return result.done ? this.stepBack(pos) : this.stepAhead(pos);
    }
    isDone() {
        return this.is_done;
    }
}

module.exports = Path;