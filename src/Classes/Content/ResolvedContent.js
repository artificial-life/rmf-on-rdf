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
    return this.parent.save(this.content);
  }
}

module.exports = ResolvedContent;