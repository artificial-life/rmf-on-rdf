'use strict'

var _ = require('lodash');

var Content = require('./Content.js');

class POV extends Content {
  constructor() {
    super();
    this.counter = 0;
  }
  addContent(content) {
    //@NOTE: repack content
    var path;
    var collection_key = this.makeKey();

    for (path of content.path) {
      var {
        atom_path,
        atom
      } = path;

      var type = atom_path.splice(-1);

      atom_path.push(collection_key);

      this.addAtom(atom, type, ...atom_path);
    }

    this.counter += 1;
  }
  get length() {
    return this.counter;
  }
  makeKey() {
    return this.counter;
  }
}


module.exports = POV;