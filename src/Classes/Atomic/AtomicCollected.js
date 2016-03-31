'use strict'

var _ = require('lodash');

var AtomicBasic = require('./AtomicBasic.js');
var CollectionAccessor = require('./Accessor/CollectionAccessor.js');
var BaseCollection = require('./BaseTypes/BaseCollection.js');

class AtomicCollected extends AtomicBasic {
  constructor(collection_id = 'collection_id') {
    super(BaseCollection, new CollectionAccessor(collection_id));
    this.collection_id = collection_id;
  }
  addAtom(atom) {
    if (!this.CollectionModel) this.CollectionModel = atom.Model;
    this.accessor.add(atom.accessor);
  }
  builder(data) {
    var Model = this.Model;
    var obj = new Model(this.collection_id, this.CollectionModel);
    obj.build(data);
    return obj;
  }
}


module.exports = AtomicCollected;