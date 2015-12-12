'use strict'

var _ = require('lodash');
var uuid = require('node-uuid');

class FactoryDataProvider {
  constructor() {
    this.ingredients = {};
    this.storage_accessor = null;
  }
  addStorage(accessor) {
    this.storage_accessor = accessor;
    return this;
  }
  addIngredient(ingredient) {
    this.ingredients[ingredient.property] = ingredient;
    return this;
  }
  get(params) {
    let complete = _.reduce(this.ingredients, (result, ingredient, property) => {
      let source = ingredient.get(params);

      return _.reduce(source, (vv, part, index) => {
        vv[index] = vv[index] || {};
        vv[index][property] = part;
        return vv;
      }, result);
    }, {});

    return complete;
  }
  set(key, value) {
    //console.log('value', value);
    return _.reduce(value, (status, box, collection_index) => { //@NOTE: iterate thru boxes
      let reserve = _.reduce(this.ingredients, (result, ingredient, index) => result && ingredient.set(key, box[index]), true);
      let save = false;

      if (reserve) {
        box.key = 'box-' + uuid.v1();
        save = this.storage_accessor.upsert(box);
      }

      status.push(reserve && save);

      return status;
    }, []);
  }
}

module.exports = FactoryDataProvider;