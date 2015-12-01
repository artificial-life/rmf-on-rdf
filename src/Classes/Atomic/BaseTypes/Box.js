'use strict'

var BasicVolume = require('./BasicVolume.js');
var BoxIngredient = require('./Primitive/BoxIngredient.js');

class Box extends BasicVolume {
  constructor(parent) {
    super(parent);
    this.PrimitiveVolume = BoxIngredient;
  }
}

module.exports = Box;