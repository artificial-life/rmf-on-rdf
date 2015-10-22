'use strict'

var _ = require('lodash');

class POV {
    constructor(sequence) {
        var parsed = this.parse(sequence);

        this.state = parsed.getState();
        this.attribute_map = parsed.attribute_map
    }
    parse(sequence) {
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

        return base;
    }
    observe() {

    }
    reserve() {

    }
}

module.exports = POV;