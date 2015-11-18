'use strict'

//@TODO: remove it when proxies come to live
var Reflect = require('harmony-reflect');

function ProxifyCollection(collection) {
  if (!collection) throw new Error('collection required');
  if (!(collection.collectionMethod instanceof Function)) throw new Error('collectionMethod function required');

  let handler = {
    get(target, propKey) {
      if (target.hasOwnProperty(propKey) && !(target[propKey] instanceof Function)) return target[propKey];

      return function(...args) {
        let params = args[0] || {};
        let id = params[target.collection_id];

        if (id) {
          return target.collectionMethod(propKey, ...args);
        } else {
          const origMethod = target[propKey];
          if (!origMethod) throw new Error('no such method in collection');

          return origMethod.apply(this, args);
        }
      };
    }
  };

  return new Proxy(collection, handler);
}

module.exports = ProxifyCollection;