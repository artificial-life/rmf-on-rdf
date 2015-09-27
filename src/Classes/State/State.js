'use strict'

var SingleState = require('./SingleState.js');

class State {
    constructor(data_array) {
        this.states = _.map(data_array, (item) => this.buildState(item));
    }
    isConsumable() {
        return !!this.consumable;
    }
    setConsumable(value) {
        this.consumable = value;
    }
    buildState(item) {
        if (item instanceof SingleState) return item;

        if (item instanceof State) return this.unpack(item);

        return new SingleState(item);
    }
    unpack(State) {
        //@TODO: do it later
        return [];
    }
    resolve(params) {
        return _.map(this.states, (state) => {
            state.resolve(params)
        });
    }
    observe(data) {
        var observed = _.map(this.resolve(data), (final) => final.observe(data));
        var observed_state = new State(observed);

        return observed;
    }
    reserve(data) {

    }
    intersection(state) {

    }
    union(state) {

    }
    negative() {

    }
    getSingle(name) {

    }
}

module.exports = State;