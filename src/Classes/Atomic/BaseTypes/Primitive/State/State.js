'use strict'

const MARK = Symbol('STATE');

class State {
  constructor(state) {
    this[MARK] = state.toLowerCase();
  }
  get mark() {
    return this[MARK];
  }
  toString() {
    return this[MARK];
  }
  haveState(state) {
    return this[MARK] == state;
  }
  mix(state) {
    var state_str = state.mark === this.mark ? this.mark : 'mixed';

    return new State(state_str);
  }
}

module.exports = State;