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
		let ops_info_path = ['<namespace>attribute', 'ops_info'];

		let service_id = selection.service;
		let time_description = selection.time_description;

		return this.ingredient.resolve({
				query: {
					operator_id: selection.operator,
					employee_id: selection.operator,
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
				let info_atom = resolved.getAtom(ops_info_path);

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
					}),
					ops_info: info_atom.observe({
						employee_id: selection.operator
					})
				};
				return Promise.props(o_atoms);
			})
			.then((observed) => {
				let ops_info = observed.ops_info;
				let allowed_ops = _.keys(_.pickBy(ops_info.serialize(), (op) => (op.state === 'active')));
				let services = _.pick(observed.services.content, allowed_ops);
				let op_plans = _.pick(observed.op_plans.content, allowed_ops);

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

	free(value) {
		let plans_path = ['<namespace>content', 'plan'];
		let ingredient_atom = this.ingredient.getAtom(plans_path);

		return ingredient_atom.resolve({
				query: {
					operator_id: value.operator,
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
		let ops_info_path = ['<namespace>attribute', 'ops_info'];
		let ingredient_atom = this.ingredient.getAtom(plans_path);
		let info_atom = this.ingredient.getAtom(ops_info_path);
		let data = _.isArray(value) ? value : [value];
		let selection = params.selection[this.property];
		let saving_meta = {};

		return Promise.props({
				filter: info_atom.resolve({
					query: {
						employee_id: '*'
					}
				}),
				source: ingredient_atom.resolve({
					query: {
						operator_id: selection.operator,
						date: selection.dedicated_date,
						selection: {
							service_id: selection.service
						}
					}
				})
			})
			.then(({
				source: resolved,
				filter: ops_info
			}) => {
				let allowed_ops = _.keys(_.pickBy(ops_info.serialize(), (op) => (op.state === 'active')));
				let approval = _.every(data, (tick) => (!!~_.indexOf(allowed_ops, tick.operator)));

				if(!approval)
					return false;
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