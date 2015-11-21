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


  /*=======================TEST=======================*/
  save() { //@NOTE : just for testing, this wouldn't work right with collections

    var parent_path = this.selector().traverse();
    var atom_data;
    var result = [];

    for (atom_data of path) {
      var {
        atom_path: atom_path,
        atom: atom
      } = atom_data;

      if (atom.stored_changes.length) {
        let traget_atom = this.parent.getAtom(atom_path);
        //@TODO: need some way to get source of atom
        let source = this.getSourceAtom(target_atom);
        //@TODO: need some clear way to store resolving query
        let params = atom.resolve_params || {};
        let resolve_source = source.resolve(params);

        let changes_status = [];

        _.forEach(atom.stored_changes, (change) => {
          let local_status = resolve_source.put(change);
          changes_status.push(local_status);
        });

        atom.stored_changes.length = 0;

        //@TODO: check changes status: if  (changes_status)....
        let stauts = target_atom.save(resolve_source);
        result.push(status);
      }

      //@TODO: make statuses more informative

    }

    return result;
  }
  getSourceAtom(atom) {
    return !atom.source_atom ? atom : this.getSourceAtom(atom.source_atom)
  }
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
  reserve() {
    var atom_data;

    for (atom_data of this.path) {
      var {
        atom_path: atom_path,
        atom: atom
      } = atom_data;

      var params = this.path.getQueryParams();

      var after_reserve = atom.reserve(params);

      if (after_reserve) this.addAtom(atom_path, after_reserve);
    }

    return this;
  }
  reset() {
    var path = this.selector().traverse();
    var atom_data;

    for (atom_data of path) {
      var {
        atom_path: atom_path,
        atom: atom
      } = atom_data;

      if (atom.parent) this.addAtom(atom_path, atom.parent);
    }

    return this;
  }

  /*=======================TEST=======================*/

}

module.exports = ResolvedContent;