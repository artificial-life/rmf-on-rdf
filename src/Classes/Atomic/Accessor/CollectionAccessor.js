'use strict'

var _ = require('lodash');

var AbstractAccessor = require('./AbstractAccessor.js');

class CollectionAccessor extends AbstractAccessor {
  constructor(collection_id) {
    super();
    this.collection_id = collection_id;
  }
  callMethod(method_name, context) {
    var ids = context[this.collection_id];
    var result = [];

    if (_.isUndefined(ids)) throw new Error('collection index is missing');

    if (_.isArray(ids)) {
      _.forEach(ids, (id) => result[id] = this.accessors[id][method_name](context));
    } else
    if (_.isObject(ids)) {
      var step = ids.step || 1;
      var i;

      for (i = ids.from; i <= ids.to; i += step) {
        result[i] = this.accessors[i][method_name](context);
      }
    } else {
      result[ids] = this.accessors[ids][method_name](context);
    }

    return result;
  }
  get(context) {
    return this.callMethod('get', context);
  }
  set(data) {
    return this.callMethod('set', data);
  }
  add(accessor) {
    this.accessors.push(accessor);
  }
}

module.exports = CollectionAccessor;