'use strict'

var _ = require('lodash');

var AbstractVolume = require('./AbstractVolume.js');
var PrimitiveVolume = require('./Primitive/PrimitiveVolume.js');


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
        if (!_.isEmpty(this.content)) throw Error('Content already set');
        this.content = primitive;
        return this;
    }
    build(data) {
        var primitive_volume = this.buildPrimitiveVolume(data);
        this.extendPrimitive(primitive_volume);
    }
    observe() {
        var result = new ZeroDimensional(this);
        var state = this.getContent().getState();
        result.build({
            state: state
        });
        return result;
    }
}

module.exports = ZeroDimensional