'use strict'

var Content = require('./Content.js');

const builder_namespace = 'builder';
const storage_namespace = 'storage';

class Factory extends Content {
  addStorage(atom) {
    return this.addAtom(atom, storage_namespace);
  }
  addBuilder(atom) {
    return this.addAtom(atom, builder_namespace);
  }
  getStorage() {
    return this.getAtom(['<namespace>content', storage_namespace]);
  }
  getBuilder() {
    return this.getAtom(['<namespace>content', builder_namespace])
  }
  build(params) { //@NOTE: that's specific to factory content
    return this.selector().id('<namespace>content').id(builder_namespace).resolve(params);
  }
  observe(params) {

  }
  reserve() {

  }
}

module.exports = Factory;