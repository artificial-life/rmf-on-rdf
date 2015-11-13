'use strict'

var Content = require('./Content.js');

class Factory extends Content {
  constructor() {
    super();

  }
  addStorage(atom) {
    //@TODO: define AtomicStorage
    // if (!(atom instanceof AtomicStorage)) throw new Error('only atomic storage can be attached ');
    return this.addAtom(atom, 'Storage');
  }
  addBuilder(atom) {
    // @TODO: I know, how to deal with it. I'm just going to leave this here for a moment
    // var ingredients = _.map(this.ingredients, (ingredient) => {
    //   return ingredient.observe(params);
    // });
    //
    // var raw_data = this.algorithm(...ingredients);
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