'use strict'

var _ = require('lodash');

class FactoryDataProvider {
  constructor(size) {
    this.size = size;
  }
  setSize(size) {
    this.size = size;
  }
  setIngredient(path, resoucre_source) {
    this.ingredient_atom = resoucre_source.getAtom(path);
  }
  get(params) {
    var count = params.count;
    var selection = params.selection;

    var resolved = this.ingredient_atom.resolve(selection).observe(selection);

    var splitted_content = resolved.split(this.size).getContent().splice(0, count); //array of TimeChunk

    if (splitted_content.length != count) throw new DogeError({
      so: 'few ingredients',
      such: 'much boxes'
    });

    return _.map(splitted_content, (chunk) => [chunk.toJSON()])
  }
  set(key, value) {

  }
}

module.exports = FactoryDataProvider;