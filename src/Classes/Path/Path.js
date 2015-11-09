'use strict'

var _ = require('lodash');

//@NOTE: selector could be specific to storage type
var Selector = require('./ObjectSelector.js');

class Path {
  constructor(collection) {
    this.collection = collection;
    this.path_selector = new Selector(this.collection);
    this.keys = [];
  }
  get chain() {
    return this.selector().getChain();
  }
  selector() {
    return this.path_selector;
  }
  makeInitial() {
    return this.selector().makeInitial();
  }
  isDone() {
    return this.is_done;
  }
  next() {
    if (!this.keys.length && this.chain.length) {
      this.keys = this.makeInitial();
    }

    if (this.is_done) return {
      done: true
    };

    var result = this.stepBack(this.keys.length);
    //console.log(this.collection);

    return result.done ? result : {
      done: false,
      value: {
        atom: _.get(this.collection, this.keys),
        atom_path: this.keys
      }
    };
  }
  stepAhead(index) {
    if (index == this.chain.length - 1) {
      return {
        value: this.keys,
        done: false
      };
    }

    var pos = index + 1;

    //@NOTE: little hack to not play with arrays when there is no need
    var init = this.chain[pos].constructor.name == 'AllIterator' ? this.keys.slice(0, pos - this.keys.length) : {};

    var result = this.chain[pos].reset(init).next();
    this.keys[pos] = result.value;

    return result.done ? this.stepBack(pos) : this.stepAhead(pos);
  }
  stepBack(index) {
    if (index == 0) {
      this.is_done = true;
      return {
        done: true
      };
    }

    var pos = index - 1;

    var result = this.chain[pos].next();
    this.keys[pos] = result.value;

    return result.done ? this.stepBack(pos) : this.stepAhead(pos);
  }

  /*Iterator*/
  [Symbol.iterator]() {
    return !this.chain.length ? this.selector().traverse() : {
      next: this.next.bind(this)
    };
  }
}

module.exports = Path;