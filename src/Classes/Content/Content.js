'use strict'

var _ = require('lodash');

var AtomicFactory = require('./AtomicFactory.js');
var AtomicBasic = require('./AtomicBasic.js');

var ResolvedContent = require('./ResolvedContent.js');
var Path = require('./Path/Path.js');



var traverse = function(obj, callback) {
  var key_array = [];

  (function fn(obj, depth) {
    _.forIn(obj, function(val, key) {
      key_array[depth] = key;

      if (obj[key] instanceof AtomicBasic) {
        callback(key_array);
      } else
      if (_.isObject(obj[key])) {
        fn(obj[key], depth + 1);
      }

    });
  })(obj, 0);
};

var data = {
  'z': {
    'x': new AtomicBasic()
  },
  'h': {
    'g': new AtomicBasic()
  }
};

traverse(data, (p) => {
  console.log(p);
});

class Content {
  constructor(descriptions) {
    this.descriptions = descriptions;
    this.atoms = _.map(descriptions, (item) => this.buildContent(item));

    //@NOTE: new way to store atoms
    this.content_map = {
      '<namespace>conetnt': {},
      '<namespace>attribute': {}
    };

    this.path = new Path(this.content_map);

    this.is_editable = true;
  }
  addAtom(atom, atom_uri, ...path) {
    path = path.length ? path : ['<namespace>conetnt'];
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