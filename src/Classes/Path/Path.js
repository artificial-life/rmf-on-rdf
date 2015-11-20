'use strict'

var _ = require('lodash');

//@NOTE: selector could be specific to storage type
var Selector = require('./ObjectSelector.js');

//@NOTE: this currently under rework and may not match final specification
class Path {
  constructor(collection) {
    this.collection = collection;
    this.path_selector = new Selector(this.collection);
    //@TODO: add one dimension after add() realization
    //@TODO: keys will become 2d array, query_params - 1d array
    this.keys = [];
    this.query_params = false;
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
  add() { //@NOTE: adds another selector chain
    //@TODO: make it after other experimental features
    return this;
  }
  reset() { //@TODO: under rework now
    this.is_done = false;
    this.keys = [];
    this.selector().reset();
    return this;
  }
  query(params) { //@NOTE: this isn't even my final form
    this.query_params = params;
  }
  getQueryParams() {
    //@NOTE: get current params for iteration, it's very simple now
    //@NOTE: use "current_chain" after
    return this.query_params;
  }

  //@NOTE: proxy of selector interface
  //@NOTE: may be reworked as selectorMethod(method_name, method_params)
  all() {
    this.selector().all();
    return this;
  }
  list(array) {
    this.selector().list(array);
    return this;
  }
  range(from, to) {
    this.selector().range(from, to);
    return this;
  }
  id(data) {
    this.selector().id(data);
    return this;
  }
  traverse() {
    return this.selector().traverse();

  }

  //@NOTE: end of manual proxing

  next() {
    if (!this.keys.length && this.chain.length) {
      this.keys = this.makeInitial();
    }


    if (this.isDone()) return {
      done: true
    };

    var result = this.stepBack(this.keys.length);

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