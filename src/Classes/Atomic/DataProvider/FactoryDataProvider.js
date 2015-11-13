'use strict'

var _ = require('lodash');

class FactoryDataProvider {
  constructor(setter) {
    this.setter = setter;
    this.ingredients = [];
    this.algorithm = () => {
      throw new Error('u should specify algorithm');
    };
  }
  addIngredient(ingredient) {
    this.ingredients.push(ingredient);
  }
  addAlgorithm(algorithm) {
    this.algorithm = algorithm;
  }
  get(params) {
    var results = _.map(this.ingredients, (ingredient) => ingredient.observe(params));
    return this.algorithm(...results);
  }
  set(key, value) {
    // key = {
    //   ingredients: [],
    //   save_to: 'key for saving'
    // }

    var saving_key = key.save_to;
    var ingredients_data = key.ingredients;

    var push_to_storage_status = this.setter(saving_key, value);

    var ingredients_status = _.map(this.ingredients, (ingredient, index) => {
      var data = ingredients_data[index];
      return ingredient.reserve(data);
    });

    return {
      composed: push_to_storage_status,
      ingredients: ingredients_status
    };
  }
}

module.exports = FactoryDataProvider;