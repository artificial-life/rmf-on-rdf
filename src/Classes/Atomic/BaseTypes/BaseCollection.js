'use strict';

var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');

var _ = require('lodash');

class BaseCollection {
  constructor(collection_id, collection_type) {
    this.collection_type = collection_type;
    this.collection_id = collection_id;
    this.content = [];

    return ProxifyCollection(this);
  }
  build(data_array) {
    var Model = this.collection_type;

    _.forEach(data_array, (data, index) => {
      var obj = new Model();
      this.content[index] = obj;
      obj.build(data);
    });
  }
  collectionMethod(method_name, params) {
    var id = params[this.collection_type];
  }
}

module.exports = BaseCollection;