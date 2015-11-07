'use strict'

var _ = require('lodash');

var AtomicFactory = require('./AtomicFactory.js');
var AtomicBasic = require('./AtomicBasic.js');

var ResolvedContent = require('./ResolvedContent.js');
var Path = require('./Path/Path.js');



var traverse = function(obj) {
  var key_array = [];

  function* fn(obj, depth = 0) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        key_array[depth] = key;
        if (obj[key] instanceof AtomicBasic) {
          yield obj[key];
        } else
        if (_.isObject(obj[key])) {
          yield * fn(obj[key], depth + 1);
        }
      }
    }
  };
  return fn.bind(null, obj);
};

class Content {
  constructor(descriptions) {
    this.descriptions = descriptions;
    this.atoms = _.map(descriptions, (item) => this.buildContent(item));

    //@NOTE: new way to store atoms
    this.content_map = {
      '<namespace>content': null,
      '<namespace>attribute': null
    };
    this.traverse = traverse(this.content_map);
    this.path = new Path(this.content_map);

    this.is_editable = true;
  }
  addAtom(atom, atom_uri, ...path) {
    path = path.length ? path : ['<namespace>content'];
    path.push(atom_uri);

    if (_.has(this.content_map, path)) throw new Error("This path is used already");

    _.set(this.content_map, path, atom);

    return this;
  }
  set editable(value) {
    this.is_editable = value;
  }
  isEditable() {
    return this.is_editable;
  }
  buildContent(item) {
      return AtomicFactory.create(item.content_type, item);
    }
    //@TODO: rework it with selectors
  resolve(params) {
    var resolved = _.map(this.atoms, (atom) => atom.resolve(params));

    return new ResolvedContent(resolved, this);
  }

  //Stage 2 resolver
  resolveAll(params) {
    var paths = this.traverse();
    var resolved = [];

    for (var atom of paths) {
      resolved.push(atom.resolve(params));
    }
    return new ResolvedContent(resolved, this);
  }
  save(data) {
    return _.map(data, (content, index) => {
      //@TODO: need some cheks here
      if (!content) return true;

      if (content.constructor.name !== this.descriptions[index].type) return false;

      return this.atoms[index].save(content)
    });
  }
  getAtom(name) {
    return '???'
  }
}

module.exports = Content;