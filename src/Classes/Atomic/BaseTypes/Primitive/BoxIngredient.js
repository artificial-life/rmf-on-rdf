'use strict'

var PrimitiveVolume = require('./PrimitiveVolume.js');

class BoxIngredient extends PrimitiveVolume {
  constructor(init_data, state = 'a') {
    super(init_data, state);
  }
  set data(description) {
    this.ingredient = description;
    return this;
  }
}

module.exports = BoxIngredient;