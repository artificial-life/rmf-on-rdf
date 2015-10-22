'use strict'

var _ = require('lodash');

var AbstractVolume = require('./AbstractVolume.js');
var ZeroDimensional = require('./ZeroDimensionalVolume.js');
var CommonStrategy = require('./PlacingStrategy/Common.js');

class BasicVolume extends AbstractVolume {
    constructor(parent) {
        super(parent);
        this.content = [];
    }
    get strategy() {
        return CommonStrategy;
    }
    clone(parent = false) {
        throw new Error('BasicVolume abstract method "clone"');
    }
    getDescription() {
        return this.getParams().getDescription();
    }
    buildPrimitiveVolume(item) {
        return item instanceof this.PrimitiveVolume ? item : new this.PrimitiveVolume(item.data, item.state);
    }
    put(item) {
        var volume = this.buildPrimitiveVolume(item);

        var result = [];

        _.forEach(this.getContent(), (chunk) => {
            if (chunk.intersectsWith(volume)) {
                var processed = this.applyStrategy(volume, chunk);

                if (processed.length) {
                    //@TODO: check performance here
                    result = result.concat(processed);
                }
            } else {
                result.push(chunk);
            }
        });

        result.push(volume);

        var final = new this.constructor(this);
        final.build(result);
        return final;
    }
    applyStrategy(newbee, target) {

        var action = this.strategy.getStrategy(newbee.getState(), target.getState());
        var result = action(newbee, target);

        return result;
    }
    extend(source, sort = true) {
        var ext = this.extractContent(source);

        _.forEach(ext, (primitive) => {
            this.extendPrimitive(primitive);
        });

        if (sort) this.sort();

        return this;
    }
    extendPrimitive(primitive) {
        this.content.push(primitive);
        return this;
    }
    getContent() {
        return this.content;
    }
    extractContent(item) {
        var is_same_type = item.constructor.name === this.constructor.name;

        var is_primitive = item instanceof this.PrimitiveVolume;
        var is_zero_dim = item instanceof ZeroDimensional;

        if (!(is_same_type || is_primitive || is_zero_dim)) throw new Error('Can not extract');

        var content = [];

        if (is_zero_dim) {
            var state = item.getContent().getState();
            var default_primitive = new this.PrimitiveVolume([], state);
            return [default_primitive];
        } else content = is_same_type ? item.getContent() : [item]


        return content;
    }
    build(data) {
        //@TODO:build from state 
        //@TODO: find some builder pattern for this case
        if (data instanceof this.PrimitiveVolume) {
            this.extend(data, false);
            return this;
        }

        if (_.isArray(data)) {
            _.forEach(data, (raw_data) => {
                var primitive_volume = this.buildPrimitiveVolume(raw_data);
                this.extend(primitive_volume, false);
            });
        }

        return this;
    }
    sort() {
        throw new Error('Volume specific function');
    }
}

module.exports = BasicVolume;