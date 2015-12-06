'use strict'

var _ = require('lodash');

class FactoryDataProvider {
  constructor(collection_id) {
    this.collection_id = collection_id;
  }
  addIngredient(ingredient) {
    this.ingredientDataProvider = ingredient;
  }
  addStorage(storage) {
    this.storageDataProvider = storage;
  }
  get(params) {
    var storage = this.storageDataProvider;
    var ingredient = this.ingredientDataProvider;

    return params.hasOwnProperty(this.collection_id) ? storage.get(params) : ingredient.get(params);
  }
  set(key, value) {

  }
}

module.exports = FactoryDataProvider;