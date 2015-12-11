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
  }
  addIngredient(ingredient) {
    this.ingredients[ingredient.property] = ingredient;
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

      let box_save = _.reduce(this.ingredients, (result, ingredient, index) => result && ingredient.set(key, box[index]), true);

      let full_save = false;

      if (box_save) {
        let id = uuid.v1();
        box.key = id;

        full_save = this.storage_accessor.upsert(box);
      }

      status.push(box_save && full_save);

      return status;
    }, []);
  }
}

module.exports = FactoryDataProvider;