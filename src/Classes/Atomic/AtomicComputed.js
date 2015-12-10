'use strict'

var _ = require('lodash');

var AtomicBasic = require('./AtomicBasic.js');

//@TODO: rework it to store only accessors and types

class AtomicComputed extends AtomicBasic {
  constructor(source_atom) {
    if (!source_atom) throw new Error('source atom required');

    super(source_atom.Model, source_atom.accessor);

    this.content = [source_atom];
  }
  addAtom(atom) {
    this.content.push(atom);
  }
  resolve(params) {

    return _.reduce(this.content, (result, atom) => {
      var resolved = atom.resolve(params);
      return !result ? resolved : result.intersection(resolved);
    }, false);
  }
  get source_atom() {
    return this.content[0];
  }
  save(data) {
    //@NOTE: direct_call set to false
    return this.source_atom.save(data, false);
  }
}


module.exports = AtomicComputed;