'use strict'

var _ = require('lodash');

class FactoryDataProvider {
  constructor() {

    this.ingredients = [];
  }
  addIngredient(ingredient) {
    this.ingredients.push(ingredient);
  }
  get(params) {
    let complete = _.reduce(this.ingredients, (result, ingredient) => {
      let source = ingredient.get(params);
      let type = source.type;

      return _.reduce(source.data, (vv, part, index) => {
        vv[index] = vv[index] || {};
        vv[index][type] = part;
        return vv;
      }, result);
    }, {});

    return complete;
  }
  set(key, value) {
    console.log('value', value);
    console.log('key', key);
  }
}

module.exports = FactoryDataProvider;