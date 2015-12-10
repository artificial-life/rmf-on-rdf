'use strict'

var _ = require('lodash');

var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');
var BaseCollection = require('./BaseCollection.js');

class Hashmap extends BaseCollection {
  constructor(models, hash_id) {
    super(models, hash_id);

    this.collection_type = _.reduce(this.collection_type, (result, model) => {
      result[model.name.toLowerCase()] = model;
      return result;
    }, {});
  }
  build(items) {

    this.content = _.reduce(items, (result, single_item, index) => {
      let Model = this.collection_type[index];
      let obj = new Model();
      obj.build(single_item);

      result[index] = obj;
      return result;
    }, {});

  }
}

module.exports = Hashmap;