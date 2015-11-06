'use strict'

var _ = require('lodash');

var Selector = require('./Selector.js');

class Path {
    constructor(collection) {
        this.collection = collection;
        this.path_selector = new Selector(this.collection);
        this.keys = [];
    }
    get chain() {
        return this.path_selector.getChain();
    }
    selector() {
        return this.path_selector;
    }
    makeInitial() {
        return this.path_selector.makeInitial();
    }
    isDone() {
        return this.is_done;
    }

    /*Iterator*/
    [Symbol.iterator]() {
        var iterator = {};

        iterator.next = this.next.bind(this);
        return iterator;
    }
    next() {
        if (!this.keys.length && this.chain.length) {
            this.keys = this.makeInitial();
        }

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

}

module.exports = Path;