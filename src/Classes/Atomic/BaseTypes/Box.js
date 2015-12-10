'use strict'

var _ = require('lodash');

var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');
var Hashmap = require('./Hashmap.js');

class Box extends Hashmap {
  constructor(models, hash_id) {
    super(models, hash_id);

    if (this.constructor.name == 'Box') return ProxifyCollection(this);
  }
  collectionMethod(method_name, passed) {
    let ids = passed[this.collection_id];
    ids = _.isArray(ids) ? ids : [ids];
    let Me = this.constructor;
    let result = new Me(this.collection_type, this.collection_id);
    let data = {};

    let collection = {};
    let empty = false;
    //@NOTE: generator will be here

    for (let i = 0; i < ids.length; i += 1) {
      let id = ids[i];
      collection[id] = this.content[id][method_name](passed.selection[id]);
      if (!collection[id] || collection[id].content.length == 0) {
        empty = true;
        break;
      }
    }

    result.content = collection;
    return empty ? undefined : result;
  }
}

module.exports = Box;