'use strict'

var _ = require('lodash');

//Content with writable initial data storage
//storage should be represented as static data, not function
var AbstractVolume = require('./BaseTypes/AbstractVolume.js');

class AtomicBasic {
  constructor(Model, accessor) {
    this.Model = Model;
    this.accessor = accessor;
  }
  resolve(params) {
    var data = this.accessor.get(params);
    return this.builder(data);
  }

  save(data, direct_call = true) {
    //@NOTE: direct_call indicates that saving was called right from atom or thru atom chain

    if (_.isArray(data.stored_changes)) {
      //@NOTE: Here should be step by step commit of changes
    }

    if (data instanceof AbstractVolume) return this.accessor.set(data.serialize());

    return this.accessor.set(data);
  }
  builder(data) {
    var Model = this.Model;
    var obj = new Model();
    obj.build(data);
    return obj;
  }
}

module.exports = AtomicBasic;