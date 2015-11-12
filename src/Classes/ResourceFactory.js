'use strict'

var Content = require('./Content.js');

class Factory extends Content {
  constructor() {
    super();

    this.algorithm = () => {
      throw new Error('algorithm required');
    };
  }
  addStorage(atom) {
    //@TODO: define AtomicStorage
    // if (!(atom instanceof AtomicStorage)) throw new Error('only atomic storage can be attached ');
    return super.addAtom(atom, 'Storage');
  }
  addBuilder(algorithm, ...ingredients) {
    // @TODO: I know, how to deal with it. I'm just going to leave this here for a moment
    // var ingredients = _.map(this.ingredients, (ingredient) => {
    //   return ingredient.observe(params);
    // });
    //
    // var raw_data = this.algorithm(...ingredients);
  }
  addIngredient(ingredient) {
    //@TODO: define Ingredient
    // if (!(ingredient instanceof Ingredient)) throw new Error('ingredient should be child of Ingredient');
    this.ingredients.push(ingredient);
    return this;
  }
  setAlgorithm(algorithm) {
    this.algorithm = algorithm.bind(this);
  }
  build(params) { //@NOTE: that's specific to factory content
    return this.selector().id('<namespace>content').id('Builder').resolve(params);
  }
  getStorage() {
    return super.getAtom('<namespace>content', 'Storage')
  }
  getBuilder() {
    return super.getAtom('<namespace>content', 'Builder')
  }
  observe(params) {

  }
  reserve() {

  }
}

module.exports = Factory;