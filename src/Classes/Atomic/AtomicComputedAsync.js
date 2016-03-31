'use strict'

var AtomicBasicAsync = require('./AtomicBasicAsync.js');

//@TODO: rework it to store only accessors and types

class AtomicComputedAsync extends AtomicBasicAsync {
	constructor(source_atom) {
		if (!source_atom) throw new Error('source atom required');

		super(source_atom.Model, source_atom.accessor);

		this.content = [source_atom];
	}

	addAtom(atom) {
		this.content.push(atom);
	}

	resolve(params) {
		return Promise.mapSeries(this.content, (atom) => atom.resolve(params))
			.then((res) => {
				let re = _.reduce(res, (result, resolved) => {
					return !result ? resolved : result.intersection(resolved);
				}, false);
				console.log("COMPUTED RE", require('util')
					.inspect(res, {
						depth: null
					}));
				return re;
			});
	}

	get source_atom() {
		return this.content[0];
	}

	save(data) {
		//@NOTE: direct_call set to false
		return this.source_atom.save(data, false);
	}
}


module.exports = AtomicComputedAsync;
