'use strict'

var _ = require('lodash');

var FunctionalEntity = require('./FunctionalEntity.js');

class Mediator extends FunctionalEntity {
    constructor(mixer, context) {
        super();
        this.mixer = mixer;
        this.basic_context = context;
    }
    resolve(additional_context) {
        var context = _.assign(this.basic_context, additional_context);

        return this.method(context);
    }
}

module.exports = Mediator;