'use strict';

var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');

var _ = require('lodash');

class BaseCollection {
  constructor(collection_type, collection_id) {
    this.collection_type = collection_type;
    this.collection_id = collection_id;
    this.content = {};

    return ProxifyCollection(this);
  }
  build(items) {
    var Model = this.collection_type;

    _.forEach(items, (single_item, index) => {
      var obj = new Model();
      obj.build(single_item);
      this.content[index] = obj;
    });

  }
  collectionMethod(method_name, passed) {
    var id = passed[this.collection_id];
    var result = new BaseCollection(this.collection_type, this.collection_id);
    var data = {};

    result.content[id] = this.content[id][method_name](passed.params);

    return result;
  }
}

module.exports = BaseCollection;