'use strict'

var _ = require('lodash');

var BasicIterator = require('./BasicIterator.js');

class AllIterator extends BasicIterator {
  constructor(map, path = []) {
    super(function*(array) {
      yield * array;
    });

    this.map = map;
    this.reset(path);
  }
  reset(path) {

    var keys = path.length ? _.chain(this.map)
      .get(path)
      .keys()
      .value() : _.keys(this.map);

    this.iterator = this.generator(keys);
    return this;
  }
}


module.exports = AllIterator;