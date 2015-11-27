'use strict'

class FactoryIngredient {
  constructor(source, size) {
    this.source = source;
    this.size = size;
  }
  observe(params) {

    var resolved = this.source.selector().query(params);

    resolved.selector().query(params);

    return resolved.observe()
      .split(size);
  }
  reserve(params) {
    return this.source.reserve(params);
  }
}

module.exports = FactoryIngredient;