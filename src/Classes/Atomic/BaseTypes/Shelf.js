'use strict'

var _ = require('lodash');
var Box = require('./Box.js');
var uuid = require('node-uuid');

//@NOTE: that is Collection
class Shelf {
  constructor() {
    this.collection_type = Box;
    this.collection_content = {};
  }
  build(data) {
    var box_contents = [];
    var counter = 0;

    _.forEach(data, (ingredient_atoms, ingredient_index) => {
      _.forEach(ingredient_atoms, (atom) => {
        var name = atom.constructor.name;
        _.forEach(atom.getContent(), (item, chunk_index) => {
          _.set(box_contents, `[${chunk_index}][${ingredient_index}].data.${name}`, item);
        });
      });
    });

    _.forEach(box_contents, (single) => {
      var id = this.makeId();
      var box = new Box();
      box.build(single);
      this.collection_content[id] = box;
    });

    console.log(this.collection_content);
  }
  makeId() {
    return uuid.v1();
  }
}


module.exports = Shelf;