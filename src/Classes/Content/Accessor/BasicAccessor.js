'use strict'

var _ = require('lodash');

var AbstractAccessor = require('./AbstractAccessor.js');

class BasicAccessor extends AbstractAccessor {
    get(context) {
        var result = super.get(context);

        if (_.isUndefined(result)) throw new Error('No such key: ' + access_obj);

        return result;
    }
    set(data) {
        var status = super.set(data);

        if (!status) throw new Error('No such key: ' + access_obj);

        return status;
    }
}

module.exports = BasicAccessor;