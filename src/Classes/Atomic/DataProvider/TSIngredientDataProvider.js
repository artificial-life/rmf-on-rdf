'use strict'

let IngredientDataProvider = require("./IngredientDataProvider");

class TSIngredientDataProvider extends IngredientDataProvider {
	constructor(size) {
		super(size);
	}

	setIngredient(property, resource_source) {
		this.property = property;
		this.ingredient = resource_source;
		return this;
	}


	get(params) {
		let count = params.count;
		let size = params.size || this.size;
		let selection = params.selection[this.property];
		let plans_path = ['<namespace>content', 'plan'];
		let services_path = ['<namespace>attribute', 'services'];

		let service_id = selection.service;
		let time_description = selection.time_description;

		return this.ingredient.resolve({
				query: {
					operator_id: selection.operator,
					day: selection.day,
					date: selection.dedicated_date,
					selection: {
						service_id: selection.service,
						selection: time_description
					}
				}
			})
			.then((resolved) => {
				//had to choose between this outrageous notation and additional * queries to db
				// console.log("TSI", selection, require('util').inspect(resolved.content_map, {
				// 	depth: null
				// }));
				let observed = {
					services: resolved.getAtom(services_path).observe({
						operator_id: selection.operator,
						selection: {
							service_id: selection.service,
							selection: time_description
						}
					}),
					op_plans: resolved.getAtom(plans_path).observe({
						operator_id: selection.operator,
						selection: time_description
					})
				};

				let services = observed.services.content;
				let op_plans = observed.op_plans.content;

				return _.reduce(services, (acc, s_plans, op_id) => {
					let op_plan = op_plans[op_id];
					let s_ids = (service_id == '*' || !service_id) ? _.keys(s_plans.content) : service_id;
					s_ids = _.isArray(s_ids) ? s_ids : [s_ids];
					acc[op_id] = _.reduce(s_ids, (op_services, s_id) => {
						let plan = op_plan.intersection(s_plans.content[s_id]);
						op_services[s_id] = params.split ? plan.split(size, count) : plan;
						return op_services;
					}, {});
					return acc;
				}, {});
			});

	}

	free(params, value) {
		let plans_path = ['<namespace>content', 'plan'];
		let ingredient_atom = this.ingredient.getAtom(plans_path);
		let selection = params.selection[this.property];

		return ingredient_atom.resolve({
				query: {
					operator_id: value.operator,
					day: selection.day,
					date: value.dedicated_date
				}
			})
			.then((resolved) => {
				resolved.free({
					operator_id: value.operator,
					selection: [value.time_description]
				});
				return ingredient_atom.save(resolved);
			})
			.then((saved) => {
				return saved || false;
			})
			.catch((err) => {
				console.error(err.stack);
				return false;
			});
	}
	set(params, value) {
		// console.log("I_SET", params, value);
		let plans_path = ['<namespace>content', 'plan'];
		let ingredient_atom = this.ingredient.getAtom(plans_path);
		let data = _.isArray(value) ? value : [value];
		let selection = params.selection[this.property];
		let saving_meta = {};

		return Promise.props({
				source: ingredient_atom.resolve({
					query: {
						operator_id: selection.operator,
						day: selection.day,
						date: selection.dedicated_date,
						selection: {
							service_id: selection.service
						}
					}
				})
			})
			.then(({
				source: resolved
			}) => {
				_.map(data, (tick) => {
					resolved.reserve({
						operator_id: tick.operator,
						selection: [tick.time_description]
					});
					saving_meta[tick.id] = resolved.content[tick.operator].db_data['@id'];
				});
				return ingredient_atom.save(resolved);
			})
			.then((saved) => {
				return saving_meta || false;
			})
			.catch((err) => {
				console.error(err.stack);
				return false;
			});
	}
}

module.exports = TSIngredientDataProvider;