'use strict'

var _ = require('lodash');

var ResolvedContent = require('./ResolvedContent.js');

class BoxIterator {
  constructor(factory) {
    this.factory = factory;
    this.atoms = [];
    this.pathes = [];
    this.counter = 0;
  }
  prepare(path, atom) {
    this.pathes.push(path.join('/'))
    this.atoms.push(atom);
  }
  next() {
    var result = {};
    _.forEach(this.atoms, (atom, index) => {
      var ingredient = atom.content[this.counter];
      var path = this.pathes[index];

      result[path] = ingredient;
    });
    this.counter++;

    return result;
  }
  reset() {

  }
}

class FactoryContent extends ResolvedContent {
  constructor(parent) {
    super(parent);
    this.iterator = new BoxIterator(this);
  }
  boxes() {
    return this.iterator;
  }
  addAtom(path, atom) {
    super.addAtom(path, atom);
    this.iterator.prepare(path, atom);
    return this;
  }
}

module.exports = FactoryContent;