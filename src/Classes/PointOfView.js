'use strict'

var _ = require('lodash');

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

module.exports = POV;