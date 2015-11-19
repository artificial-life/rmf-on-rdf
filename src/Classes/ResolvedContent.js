'use strict'

var _ = require('lodash');

var Path = require('./Path/Path.js');

//@NOTE: may be ResolvedContent and Content should have common parent class
//@NOTE: something like AbcstractContent
//@NOTE: this will separated methods linked to content_map

class ResolvedContent {
  constructor(parent) {
    if (!parent) throw new Error('parent required');
    this.parent = parent;
    this.content_map = {};
    this.path = new Path(this.content_map);
    //@NOTE: this inherits query params  from resolver
    this.path.query(parent.selector().getQueryParams());
  }
  addAtom(path, atom) {
    _.set(this.content_map, path, atom);
    return this;
  }
  getAtom(path) {
    return _.get(this.content_map, path);
  }
  selector() {
    return this.path;
  }
  save() {
    var parent_path = this.parent.path.selector().traverse();
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

  /*=======================TEST=======================*/
  observe() {
    var atom_data;

    for (atom_data of this.path) {
      var {
        atom_path: atom_path,
        atom: atom
      } = atom_data;

      var params = this.path.getQueryParams();

      this.addAtom(atom_path, atom.observe(params));
    }

    return this;
  }
  reserve(params) {
    //@NOTE: not done yet
    //@TODO: draft required
  }

  /*=======================TEST=======================*/

}

module.exports = ResolvedContent;