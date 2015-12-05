'use strict'

var _ = require('lodash');

var discover = {
  module_cache: {},
  atomic_cache: {},
  dataType: function(data) {
    if (_.isString(data)) {
      var fullpath = `./BaseTypes/${data}.js`;

      if (!this.module_cache.hasOwnProperty(fullpath)) {
        this.module_cache[fullpath] = require(fullpath);
      }

      return this.module_cache[fullpath];
    }

    if (_.isObject(data)) {
      var decorator = data.deco;
      var type = data.type;
      var params = data.params;

      var TypeModel = this.dataType(type);
      var DecoModel = this.dataType(decorator);

      return DecoModel.bind(DecoModel, TypeModel, params);
    }

  },
  atomic: function(data) {

    var fullpath = `./Atomic${_.capitalize(data)}.js`;

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