'use strict'

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

    if (_.isArray(data)) {
      return _.map(data, (type) => this.dataType(type));
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

module.exports = discover;