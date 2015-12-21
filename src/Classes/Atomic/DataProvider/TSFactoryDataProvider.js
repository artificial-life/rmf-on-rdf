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
		let count = params.count;
		let plans_path = ['<namespace>content', 'plan'];
		let services_path = ['<namespace>attribute', 'services'];
		let service_id = params.query.selection.service_id;

		let observing = _.reduce(this.ingredients, (result, ingredient, property) => {
			result[property] = ingredient.resolve(params)
				.then((resolved) => {
					return resolved.observe(params.query);
				})
			return result;
		}, {});
		return Promise.props(observing)
			.then((observed) => {
				//@FIXIT : flush this monkey code ASAP
				//f*ck I tried to avoid this
				let complete = _.reduce(observed, (result, ingredient, property) => {
					let services = ingredient.getAtom(services_path);
					let op_plans = ingredient.getAtom(plans_path);

					let intersected = _.reduce(op_plans.content, (acc, op_plan, op_id) => {
						let service_plans = services.content[op_id];
						acc[op_id] = service_plans.intersection({
							service_id: service_id,
							selection: op_plan
						});
						return acc;
					}, {});
					//just pick a random op
					let op = _.sample(intersected);
					let source = _.reduce(op.content, (acc, plan, s_id) => {
						acc[s_id] = _.map(plan.split(ts_size, count), (chunk) => chunk.serialize());
						return acc;
					}, {});

					return _.reduce(source, (acc, s_source, s_key) => {
						acc[s_key] = _.reduce(s_source, (vv, part, index) => {
							vv[index] = vv[index] || {};
							vv[index][property] = part;
							return vv;
						}, {});
						return acc;
					}, result);
				}, {});
				return complete;
			});
	}
	set(key, value) {
		//stop it, you
		return false;
	}
}

module.exports = TSFactoryDataProvider;