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
					date: selection.dedicated_date,
					selection: {
						service_id: selection.service,
						selection: time_description
					}
				}
			})
			.then((resolved) => {
				//had to choose between this outrageous notation and additional * queries to db
				let services = resolved.getAtom(services_path);
				let op_plans = resolved.getAtom(plans_path);
				let o_atoms = {
					services: services.observe({
						operator_id: selection.operator,
						selection: {
							service_id: selection.service,
							selection: time_description
						}
					}),
					op_plans: op_plans.observe({
						operator_id: selection.operator,
						selection: time_description
					})
				};
				return Promise.props(o_atoms);
			})
			.then((observed) => {
				let services = observed.services;
				let op_plans = observed.op_plans;
				return _.reduce(services.content, (acc, s_plans, op_id) => {
					let op_plan = op_plans.content[op_id];
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
	set(params, value) {
		console.log("I_SET", params, value);
		let plans_path = ['<namespace>content', 'plan'];
		let ingredient_atom = this.ingredient.getAtom(plans_path);
		let data = value;
		let selection = params.selection[this.property];

		return ingredient_atom.resolve({
				query: {
					operator_id: selection.operator,
					date: selection.dedicated_date,
					selection: {
						service_id: selection.service
					}
				}
			})
			.then((resolved) => {
				let reserve =
					resolved.reserve({
						operator_id: data.operator,
						selection: [data.time_description]
					});

				return ingredient_atom.save(resolved);
			})
			.then((saved) => {
				if(!(saved))
					return false;
				return true;
			})
			.catch((err) => {
				console.error(err.stack);
				return false;
			});
	}
}

module.exports = TSIngredientDataProvider;