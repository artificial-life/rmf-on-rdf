'use strict'

var _ = require('lodash');

class IngredientDataProvider {
  constructor(size) {
    this.size = size;
  }
  setSize(size) {
    this.size = size;
    return this;
  }
  setIngredient(path, property, resoucre_source) {
    this.property = property;
    this.ingredient_atom = resoucre_source.getAtom(path);
    return this;
  }
  get(params) {
    let count = params.count;
    let selection = params.selection;

    let resolved = this.ingredient_atom.resolve(selection).observe(selection);
    let splitted = resolved.split(this.size, count); //array of Plans

    if (splitted.length != count) throw new DogeError({
      so: 'few ingredients',
      such: 'much boxes'
    });

    let result = _.map(splitted, (chunk) => [chunk.serialize()]);

    return result;
  }
  set(key, value) {

    let data = value[0].data[0];

    let resolved = this.ingredient_atom.resolve(data);
    resolved.reserve([data]);
    let save_result = this.ingredient_atom.save(resolved);

    return save_result;
  }
}

module.exports = IngredientDataProvider;