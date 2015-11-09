'use strict'

var _ = require('lodash');

var State = require('./State/State.js');

class PrimitiveVolume {
    constructor(init_data, state, owner = false) {
        if (_.isString(state)) {
            this.state = new State(state, owner);
        } else if (state instanceof State) {
            this.state = state;
        }
        this.data = init_data;
    }
    set data(init_data) {
        //primitive volume has no data, lol
    }
    static get params_description() {
        return [];
    }
    getState() {
        return this.state
    }
    getStateString() {
        return this.state.toString()
    }

    //@TODO: rework toJSON, it should be defined only here in common cases
    toJSON() {
        return {
            data: [],
            state: this.getState()
        };
    }
}

module.exports = PrimitiveVolume;