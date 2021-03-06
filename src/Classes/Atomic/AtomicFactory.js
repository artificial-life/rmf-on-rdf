'use strict'

var _ = require('lodash');

var discover = {
    module_cache: {},
    atomic_cache: {},
    dataType: function (name) {
        var fullpath = `./BaseTypes/${name}.js`;

        if (!this.module_cache.hasOwnProperty(fullpath)) {
            this.module_cache[fullpath] = require(fullpath);
        }

        return this.module_cache[fullpath];
    },
    atomic: function (type) {

        var fullpath = `./Atomic${_.capitalize(type)}.js`;

        if (!this.atomic_cache.hasOwnProperty(fullpath)) {
            this.atomic_cache[fullpath] = require(fullpath);
        }

        return this.atomic_cache[fullpath];
    }
};

class AtomicFactory {
    constructor() {
        throw new DogeError({
            so: 'Singletone',
            such: 'unique'
        });
    }
    static create(type, params) {
        var atomicModel = discover.atomic(type);
        var dataModel = discover.dataType(params.type);

        var atomic = new atomicModel(dataModel, params.accessor);

        return atomic;
    }
}

module.exports = AtomicFactory;