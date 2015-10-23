'use strict'

var _ = require('lodash');

class POV {
    constructor(sequence) {
        var parsed = this.parse(sequence);

        this.content = parsed.getContent();
        this.attribute_map = parsed.attribute_map
    }
    parse(sequence) {
        var base = null;

        _.forEach(sequence, (element) => {

            base = !base ? element : element.intersection(base);

            if (element.isConsumable()) {
                this.uri = element.getURI();
                //@TODO: get attribute map here
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