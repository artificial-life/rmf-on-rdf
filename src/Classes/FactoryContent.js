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
    this.length = 0;
  }
  prepare(path, atom) {
    this.pathes.push(path.join('||'))
    this.atoms.push(atom);

    this.length = _.size(atom.content);
  }

  * [Symbol.iterator]() {
    for (let i = 0; i < this.length; i += 1) {
      let box = new Box(this.factory.parent);

      _.forEach(this.atoms, (atom, index) => {
        let ingredient = atom.content[i];

        let path = this.pathes[index];
        box.addAtom(path.split('||'), atom.content[i]);
      });

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