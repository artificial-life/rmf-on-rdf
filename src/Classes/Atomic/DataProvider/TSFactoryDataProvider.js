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
		let plans_path = ['<namespace>content', 'plan'];
		let services_path = ['<namespace>attribute', 'services'];
		let service_id = params.query.selection.service_id;
		let operator_id = params.query.operator_id;
		let observing = _.reduce(this.ingredients, (result, ingredient, property) => {
			// ingredient.selector().query(params);
			result[property] = ingredient.resolve(params)
				.then((resolved) => {
					// console.log("RESOLVED", resolved);
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
				// console.log(require('util').inspect(observed['op_time'].content_map, {
				// 	depth: null
				// }));
				//@TODO : flush this monkey code ASAP
				//f*ck I tried to avoid this
				let complete = _.reduce(observed, (acc, ing, key) => {
					//first, intersect plans
					//then split result
					let services = observed[key].getAtom(services_path);
					let op_plans = observed[key].getAtom(plans_path);

					let intersected = _.reduce(op_plans.content, (acc, op_plan, op_id) => {
						let service_plans = services.content[op_id];
						let intersection = service_plans.intersection({
							service_id: service_id,
							selection: op_plan
						});
						console.log("AAA", op_id, intersection);
						return acc;
					}, {});
					console.log("INTERSECTED", intersected);
					// 	let splitted;
					// 	acc[key] = splitted;
				}, {})
			});

		let ops = this.ingredients.OPS;
		// let complete = {};

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