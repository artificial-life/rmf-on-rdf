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

    if (this.constructor.name == 'Hashmap') return ProxifyCollection(this);
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
  observe(params) {
    var p = {};
    //@HACK: temporary
    p[this.collection_id] = _.keys(this.collection_type);
    p.selection = params;
    console.log(p);
    return this.observe(p);
  }
}

module.exports = Hashmap;