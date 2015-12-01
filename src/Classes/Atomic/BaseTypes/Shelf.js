'use strict'

var _ = require('lodash');

//@NOTE: that is Collection
class Shelf {
  constructor() {

  }
  build(data) {
    var box_contents = {};
    var counter = 0;
    _.forEach(data, (ingredient_atoms, ingredient_index) => {
      _.forEach(ingredient_atoms, (atom) => {
        var name = atom.constructor.name;
        _.forEach(atom.getContent(), (item, chunk_index) => {

          _.set(box_contents, `${chunk_index}.[${ingredient_index}].${name}`, item);
        });
      });
    });
    console.log(box_contents);
  }
}


module.exports = Shelf;