'use strict'
//@TODO: COMPLETLY REWORK IT
//@TODO: it should be like only wrapper for State
var _ = require('lodash');

var AbstractVolume = require('./AbstractVolume.js');
var PrimitiveVolume = require('./Primitive/PrimitiveVolume.js');
var State = require('./Primitive/State/State.js');

class ZeroDimensional extends AbstractVolume {
    constructor(parent) {
        super(parent);
        this.description = [];
        this.content = {};
    }
    getDescription() {
        return [];
    }
    clone(parent) {
        var cloned = new ZeroDimensional(parent);
        cloned.build(this.content);

        return cloned;
    }
    buildPrimitiveVolume(item) {
        return item instanceof PrimitiveVolume ? item : new PrimitiveVolume([], item.state);
    }
    getContent() {
        return this.content;
    }
    extendPrimitive(primitive) {
        if (!_.isEmpty(this.content)) throw new Error('Content already set');
        this.content = primitive;
        return this;
    }
    build(data) {
        var primitive_volume = this.buildPrimitiveVolume(data);
        this.extendPrimitive(primitive_volume);
    }
    observe() {
        var result = new ZeroDimensional(this);
        var item = this.getContent().toJSON();
        result.build(item);

        return result;
    }
    intersection(ZD) {
        if (_.isEmpty(this.getContent()) || _.isEmpty(ZD.getContent())) return new ZeroDimensional(this);

        return this.observe();
    }
}

module.exports = ZeroDimensional