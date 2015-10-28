'use strict'

var _ = require('lodash');


//@TODO: should be AtomicAbstract
var AtomicContent = require('./AtomicBasic.js');


class Content {
    constructor(data_array) {
        this.atoms = _.map(data_array, (item) => this.buildContent(item));
    }
    buildContent(item) {
        if (item instanceof AtomicContent) return item;

        if (item instanceof Content) return this.unpack(item);

        return new AtomicContent(item);
    }
    unpack(Content) {
        //@TODO: do it later
        return [];
    }
    resolve(params) {
        return _.map(this.atoms, (atom) => {
            atom.resolve(params)
        });
    }
    observe(data) {
        var observed = _.map(this.resolve(data), (final) => final.observe(data));
        var result = new Content(observed);

        return result;
    }
    reserve(data) {

    }
    intersection(content) {

    }
    union(content) {

    }
    negative() {

    }
    getAtom(name) {

    }
}

module.exports = Content;