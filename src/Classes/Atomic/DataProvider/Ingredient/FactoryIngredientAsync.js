'use strict'

let FactoryIngredient = require("./FactoryIngredient");

class FactoryIngredientAsync extends FactoryIngredient {
	constructor(source, size) {
		super(source, size);
	}
	observe(params) {
		this.source.selector().query(params);
		var resolved = this.source.resolve();
		//@NOTE: should change "params.data" to something more understandable
		var query_data = params.data;
		resolved.selector().query(query_data);

		resolved.observe();

		var result = [];

		_.forEach(this.size, (data) => {
			var path = data.atom_path;
			var size = data.size;

			var splited = resolved.getAtom(path).split(size);
			result.push(splited);
		});
		//  .split(this.size);
		return result;
	}
	reserve(params) {
		return this.source.reserve(params);
	}
}

module.exports = FactoryIngredientAsync;