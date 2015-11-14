'use strict'

var _ = require('lodash');

class BaseCollection {
  constructor(collection_id, collection_type) {
    this.collection_type = collection_type;
    this.collection_id = collection_id;
    this.content = [];
  }
  build(data_array) {
    var Model = this.collection_type;

    _.forEach(data_array, (data, index) => {
      var obj = new Model();
      this.content[index] = obj;
      obj.build(data);
    });
  }
  observe(params) {
    var ids = params[this.collection_id];

  }
  resrve() {

  }
}

module.exports = BaseCollection