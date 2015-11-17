'use strict'

//@TODO: remove it when proxies come to live
var Reflect = require('harmony-reflect');

var _ = require('lodash');

class BaseCollection {
  constructor(collection_id, collection_type) {
    this.collection_type = collection_type;
    this.collection_id = collection_id;
    this.content = [];
    let self = this;

    let handler = {
      get(target, propKey, receiver) {
        console.log('self', propKey);
        if (self[propKey]) {
          const origMethod = self[propKey];

          return function(...args) {
            return origMethod.apply(this, args);
          };
        } else {
          return function(params) {
            var id = params[self.collection_id];

            var method = self.content[id][propKey];
            if (!method) throw new Error('no such method in collected object');

            return method.call(self.content[id], params);
          };
        }

      }
    };
    return new Proxy(this, handler);
  }
  build(data_array) {
    var Model = this.collection_type;

    _.forEach(data_array, (data, index) => {
      var obj = new Model();
      this.content[index] = obj;
      obj.build(data);
    });
  }
  test(one, two, three) {
    console.log('test');
    console.log(one, two, three);
  }
}

module.exports = BaseCollection