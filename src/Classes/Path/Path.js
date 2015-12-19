'use strict'

var _ = require('lodash');

//@NOTE: selector could be specific to storage type
var Selector = require('./ObjectSelector.js');

//@NOTE: this currently under rework and may not match final specification
class Path {
	constructor(collection) {
		this.collection = collection;
		this.default_selector = new Selector(this.collection);
		this.reset();
	}
	get chain() {
		let index = this.current_chain_index || 0;
		return this.path_selector[index].getChain();
	}
	selector(id) {
		id = id || id === 0 ? id : this.current_selector;
		return this.path_selector[id];
	}

	isDone() {
		return this.is_done;
	}
	add() {
		this.current_selector = this.path_selector.length;
		this.path_selector.push(new Selector(this.collection));

		return this;
	}
	reset() {
		this.path_selector = [];
		this.is_done = false;
		this.keys = [];
		this.default_selector.reset();
		this.query_params = [];
		this.current_chain_index = 0;
		this.current_selector = 0;
		return this;
	}
	query(params) {
		this.query_params[this.current_selector] = params;
	}
	getQueryParams() {
		return this.query_params[this.current_chain_index];
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
		return this.default_selector.traverse();
	}
	makeInitial(id) {
		return this.selector(id).makeInitial();
	}

	//@NOTE: end of manual proxing

	next() {
		if(!this.keys.length && this.chain.length) {
			this.keys = this.makeInitial(this.current_chain_index);
		}

		if(this.isDone()) return {
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
		if(index == this.chain.length - 1) {
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
		if(index == 0) {
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
		let selectors = this.path_selector.length ? this.path_selector : [this.traverse()];
		let self = this;
		return {
			next: () => {
				let result = this.next();
				if(result.done && this.current_chain_index != selectors.length - 1) {
					this.is_done = false;
					this.current_chain_index += 1;
					this.keys = [];
					result = this.next();
				}

				return result;
			}
		};
	}
}

module.exports = Path;