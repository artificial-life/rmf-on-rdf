'use strict'

var _ = require('lodash');

var ResolvedContent = require('./ResolvedContent.js');
var BaseCollection = require('./Atomic/BaseTypes/BaseCollection.js');

var Box = require('./Box.js');

class BoxIterator {
  constructor(factory) {
    this.factory = factory;
  } * [Symbol.iterator]() {
    var path = this.factory.selector().traverse();
    for (let i = 0; i < this.factory.length; i += 1) {
      let box = new Box(this.factory.parent);

      for (let atom_data of path) {
        let {
          atom_path: atom_path,
          atom: atom
        } = atom_data;

        let ingredient = atom.content[i];

        box.addAtom(atom_path, ingredient);
      }

      yield box;
    }
  }

  iterator() {

  }
  reset() {
    this.counter = 0;
    return this;
  }
}

class FactoryContent extends ResolvedContent {
  constructor(parent) {
    super(parent);
    this.length = 0;
    this.iterator = new BoxIterator(this);

  }
  boxes() {
    return this.iterator;
  }

}

module.exports = FactoryContent;