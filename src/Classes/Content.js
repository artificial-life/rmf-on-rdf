'use strict'

var _ = require('lodash');

var ResolvedContent = require('./ResolvedContent.js');
var Path = require('./Path/Path.js');

class Content {
  constructor(Resolved_Model = ResolvedContent) {
    this.content_map = {
      '<namespace>content': null,
      '<namespace>attribute': null
    };

    this.Resolved_Model = Resolved_Model;
    this.path = new Path(this.content_map);

    //@NOTE: this hack is very dirty and ugly
    //@TODO: do something, pls
    this.selector().resolve = this.resolve.bind(this);
    this.selector().observe = (params) => {
      this.resolve(params).observe(params);
      this.path.selector().reset();
    }
  }
  addAtom(atom, atom_type, ...path) {
    path = path.length ? path : ['<namespace>content'];
    path.push(atom_type);

    if (_.has(this.content_map, path)) throw new Error("This path is used already");

    _.set(this.content_map, path, atom);

    return this;
  }
  selector() {
    return this.path;
  }

  //@NOTE: semantics of this method changed
  resolve() {
    var Resolved_Model = this.Resolved_Model;

    var resolved = new Resolved_Model(this);
    var atom_data;
    for (atom_data of this.path) {
      var {
        atom_path: atom_path,
        atom: atom
      } = atom_data;
      //@NOTE: params should be specific for each branch of selection
      var params = this.path.getQueryParams() || {};
      resolved.addAtom(atom_path, atom.resolve(params));

      //@TODO: so dirty again, you shouldn't attach property this way. Never!
      resolved.resolve_params = params;
    }

    return resolved;
  }
  save(data) {
    return _.map(data, (item, index) => {
      //@TODO: need some cheks here
      if (_.isEmpty(item)) return true;

      var {
        content: content,
        path: path
      } = item;

      if (!path || !content) return false;

      var atom = this.getAtom(path);

      return content instanceof atom.Model ? atom.save(content) : false;
    });
  }
  getAtom(path) {
    return _.get(this.content_map, path);
  }
}

module.exports = Content;