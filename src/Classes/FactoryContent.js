'use strict'

var _ = require('lodash');

var ResolvedContent = require('./ResolvedContent.js');
var Box = require('./Box.js');

class BoxIterator {
  constructor(factory) {
    this.factory = factory;
    this.atoms = [];
    this.pathes = [];
    this.counter = 0;
  }
  prepare(path, atom) {
    this.pathes.push(path.join('||'))
    this.atoms.push(atom);
  }
  next() {
    var box = new Box(this.factory.parent);

    _.forEach(this.atoms, (atom, index) => {
      var ingredient = atom.content[this.counter];
      var path = this.pathes[index];
      box.addAtom(path.split('||'), atom.content[this.counter]);
    });
    this.counter++;

    return box;
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