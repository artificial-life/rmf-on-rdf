'use strict'

class Selector {
    constructor() {
        this.reset();
    }
    all() {

    }
    list(array) {

    }
    range(from, to) {

    }
    id(data) {

    }
    reset() {
        this.chain = [];
    }
    getChain() {
        return this.chain
    }
}

module.exports = Selector;