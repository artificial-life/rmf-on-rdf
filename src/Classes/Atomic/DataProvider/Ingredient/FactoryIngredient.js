'use strict'

class FactoryIngredient {
  constructor(source) {
    this.source = source;
  }
  observe(params) {
    return this.source.observe(params);
  }
  reserve(params) {
    return this.source.reserve(params);
  }
}

module.exports = FactoryIngredient;