'use strict';

var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');

var _ = require('lodash');

class BaseCollection {
  constructor(collection_type, collection_id) {
    this.collection_type = collection_type;
    this.collection_id = collection_id;


    if (this.constructor.name == 'BaseCollection') return ProxifyCollection(this);
  }
  extend(id, data) {
    this.content[id] = data;
  }
  build(items) {
    let Model = this.collection_type;

    this.content = _.reduce(items, (result, single_item, index) => {
      let obj = new Model();
      obj.build(single_item);

      result[index] = obj;
      return result
    }, {});

  }
  collectionMethod(method_name, passed) {
    var id = passed[this.collection_id];
    var Me = this.constructor;
    var result = new Me(this.collection_type, this.collection_id);
    var data = {};

    result.content[id] = this.content[id][method_name](passed.params);

    return result;
  }
}

module.exports = BaseCollection;