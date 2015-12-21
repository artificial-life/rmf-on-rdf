'use strict'

var _ = require('lodash');
var uuid = require('node-uuid');

class TSFactoryDataProvider {
	constructor() {
		this.ingredients = {};
		this.storage_accessor = null;
	}
	addStorage(accessor) {
		this.storage_accessor = accessor;
		return this;
	}
	addIngredient(ing_name, ingredient) {
		this.ingredients[ing_name] = ingredient;
		return this;
	}
	get(params) {
		let ts_size = params.ts_size || 15 * 3600;
		let observing = _.reduce(this.ingredients, (result, ingredient, property) => {
			// ingredient.selector().query(params);
			result[property] = ingredient.resolve(params)
				.then((resolved) => {
					console.log("RESOLVED", resolved);
					// ingredient.selector().query(params.query);
					return resolved.observe(params.query);
				})
			return result;
			// .then((res) => {
			// 	console.log("ING RES", res);
			// 	return _.reduce(source, (vv, part, index) => {
			// 		vv[index] = vv[index] || {};
			// 		vv[index][property] = part;
			// 		return vv;
			// 	}, result);
			// })
		}, {});
		return Promise.props(observing)
			.then((observed) => {
				console.log("OBSERVED", observed);
			});

		let ops = this.ingredients.OPS;
		// let complete = {};
		let plans_path = ['<namespace>content', 'plan'];
		let services_path = ['<namespace>attribute', 'services'];
		let service_id = params.service_id;
		let operator_id = params.operator_id;
		let time = params.time_interval;

		// let picked_op_plan = ops.getAtom(plans_path).observe({
		// 	id: operator_id,
		// 	selection: time
		// });
		//
		// let picked_service = ops.getAtom(services_path).observe({
		// 	id: operator_id,
		// 	selection: {
		// 		id: service_id,
		// 		selection: time
		// 	}
		// });

		//@IDEA: this isn't the best idea
		//let intersection = picked_op_plan.intersection(picked_service);

		return complete;
	}
	set(key, value) {
		return false;
	}
}

module.exports = TSFactoryDataProvider;