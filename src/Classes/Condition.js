'use strict'

var State = require('./State/State.js');

class Condition {
    constructor(name) {
        this.uri = name;
        this.attribute_map = {};
    }
    isConsumable() {
        return this.state || this.state.isConsumable();
    }
    getURI() {
        return this.uri;
    }
    setState(state) {
        this.state = new State(state);
    }
    getState() {
        return this.state;
    }
    addAttribute(namespace, attr) {
        this.attribute_map[namespace] = this.attribute_map[namespace] || {};
        var uri = attr.getURI();
        var state = attr.getState();
        this.attribute_map[namespace][uri] = state;
    }
    observe(params) {

    }
    reserve(params) {

    }
    intersection(condition) {

    }
}

module.exports = Condition;