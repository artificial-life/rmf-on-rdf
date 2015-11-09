'use strict'

var _ = require('lodash');

var AbstractAccessor = require('./AbstractAccessor.js');

class CacheAccessor extends AbstractAccessor {
    template(fn) {
        this.template_maker = fn;

        return this;
    }
    makeInitial(context) {
        if (!this.template_maker) throw new Error('template is not defined');

        return this.template_maker.call(this, context);
    }
    get(context) {
        var result = super.get(context);

        return _.isUndefined(result) ? this.makeInitial(context) : result;
    }
    set(data) {
        var access_obj = this.makeAccessObject('set', data);

        return this.data_provider.upsert(access_obj, data);
    }
    upsert() {
        throw new Error('this method not allowed for CacheAccessor')
    }
}

module.exports = CacheAccessor;