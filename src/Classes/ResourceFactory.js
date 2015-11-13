'use strict'

var Content = require('./Content.js');

class Factory extends Content {
  addStorage(atom) {
    return this.addAtom(atom, 'Storage');
  }
  addBuilder(atom) {
    return this.addAtom(atom, 'Builder');
  }
  getStorage() {
    return this.getAtom(['<namespace>content', 'Storage']);
  }
  getBuilder() {
    return this.getAtom(['<namespace>content', 'Builder'])
  }
  build(params) { //@NOTE: that's specific to factory content
    return this.selector().id('<namespace>content').id('Builder').resolve(params);
  }
  observe(params) {

  }
  reserve() {

  }
}

module.exports = Factory;