'use strict'

class FactoryIngredient {
  constructor(source, size) {
    this.source = source;
    this.size = size;
  }
  observe(params) {
    this.source.selector().query(params);
    var resolved = this.source.resolve();

    resolved.selector().query(params);

    return resolved.observe()
      //  .split(this.size);
  }
  reserve(params) {
    return this.source.reserve(params);
  }
}

module.exports = FactoryIngredient;