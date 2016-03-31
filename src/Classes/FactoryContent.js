'use strict'

var _ = require('lodash');

var ResolvedContent = require('./ResolvedContent.js');

class FactoryContent extends ResolvedContent {
  constructor(parent) {
    super(parent);
  }
  set length(value) {
    this.produced = 0;
  }
  get length() {
    return _.size(this.getAtom(['<namespace>builder', 'box']).content);
  }
}

module.exports = FactoryContent;