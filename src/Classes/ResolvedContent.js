'use strict'

var _ = require('lodash');

class ResolvedContent {
  constructor(parent) {
    this.parent = parent;
    this.content_map = {};
  }
  addAtom(path, atom) {
    _.set(this.content_map, path, atom);
    return this;
  }
  save() {
    var parent_path = this.parent.path;
    var atom_data;
    var result = [];

    for (atom_data of parent_path) {
      var {
        atom_path: atom_path,
        atom: atom
      } = atom_data;

      var status = atom.save(this.getAtom(atom_path));
      result.push(status);
    }

    return result;
  }
  getAtom(path) {
    return _.get(this.content_map, path);
  }
}

module.exports = ResolvedContent;