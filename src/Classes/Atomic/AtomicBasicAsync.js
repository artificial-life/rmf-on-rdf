'use strict'

var _ = require('lodash');

//Content with writable initial data storage
//storage should be represented as static data, not function
var AbstractVolume = require('./BaseTypes/AbstractVolume.js');
var BaseCollection = require('./BaseTypes/BaseCollection.js');

class AtomicBasicAsync {
	constructor(Model, accessor) {
		this.Model = Model;
		this.model_decription = {}
		this.accessor = accessor;
	}

	resolve(params) {
			return this.accessor.get(params)
				.then((data) => {
					return Promise.resolve(this.builder(data));
				});
		}
		//@TODO async this
	save(data, direct_call = true) {
		//@NOTE: direct_call indicates that saving was called right from atom or thru atom chain
		if(_.isArray(data.stored_changes) && !direct_call) {
			//@NOTE: Here should be step by step commit of changes
			var changes = data.stored_changes;
			//@TODO: this getter will be reworked
			var params = data.resolve_params;
			var resolved = this.resolve(params);
			var result = _.map(changes, (change) => resolved.put(change));
			//@TODO: check result here
			this.save(resolved, true);
		}
		let serialize = Object.getPrototypeOf(data)['serialize'];
		if(serialize instanceof Function) return this.accessor.set(data.serialize());

		return this.accessor.set(data);
	}
	builder(data) {
		let Model = this.Model;
		let obj = new Model();

		obj.build(data);

		return obj;
	}
}

module.exports = AtomicBasicAsync;