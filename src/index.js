'use strict'

var discover = (name) => {

};

class SingleState {
    constructor(params) {
        var type = params.type;
        var data = params.data;
        this.function_based = data instanceof Function;
        var Model = discover(type);


        if (this.function_based) {
            this.resolve_data = {
                model: Model,
                fn: data
            };
        } else {
            this.resolve_data = new Model(data);
        }

    }
    resolve(params) {
        if (this.function_based) {
            var data = this.resolve_data.fn(params);
            var Model = this.resolve_data.model;
            return new Model(data);
        }

        return this.resolve_data;
    }
}

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

        return new SingleState(item);
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
        this.state = state instanceof State ? state : new State(state);
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

class POV {
    constructor(sequence) {
        var base = null;

        _.forEach(sequence, (element) => {
            if (!base) {
                base = element;
            } else {
                base = element.intersection(base);
            }

            if (element.isConsumable()) {
                this.uri = element.getURI();
            }
        });

        this.state = base.getState();
        this.attribute_map = base.attribute_map
    }
    observe() {

    }
    reserve() {

    }
}

class Collection {
    constructor(povs) {
        this.state = {};
        this.attribute_map = {};

        _.forEach(povs, (pov) => {
            var uri = pov.getURI();
            this.state[uri] = pov.getState();
            this.attribute_map[uri] = pov.attribute_map;
        });
    }
    observe() {
        //get collection id
        //find resource sources
        //observe
        //make Collection
    }
    reserve() {

    }
}