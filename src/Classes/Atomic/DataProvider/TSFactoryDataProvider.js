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
		let ts_size = params.size || 15 * 3600;
		let count = params.count;
		let plans_path = ['<namespace>content', 'plan'];
		let services_path = ['<namespace>attribute', 'services'];
		//only one service so far
		let service_id = params.query.selection.service_id;
		service_id = _.isArray(service_id) ? service_id[0] : service_id;

		let observing = _.reduce(this.ingredients, (result, ingredient, property) => {
			result[property] = ingredient.resolve(params)
				.then((resolved) => {
					//just like ingredients, but not ingredients
					//had to choose between such notation and additional * queries to db
					let services = resolved.getAtom(services_path);
					let op_plans = resolved.getAtom(plans_path);
					let o_atoms = {
						services: services.observe(params.query),
						op_plans: op_plans.observe({
							operator_id: params.query.operator_id,
							selection: params.query.selection.selection
						})
					};
					return Promise.props(o_atoms);
				})
			return result;
		}, {});
		return Promise.props(observing)
			.then((observed) => {
				//@FIXIT : flush this monkey code ASAP
				//f*ck I tried to avoid this
				let complete = _.reduce(observed, (result, ingredient, property) => {

					let services = ingredient.services;
					let op_plans = ingredient.op_plans;
					let intersected = _.reduce(op_plans.content, (acc, op_plan, op_id) => {
						let service_plans = services.content[op_id];
						acc[op_id] = service_plans.intersection({
							service_id: service_id,
							selection: op_plan
						});
						return acc;
					}, {});

					//just pick a random op
					let op_id = _.sample(_.keys(intersected));
					let plan = intersected[op_id].content[service_id];
					//if intersection is empty
					if(!op_id) return result;

					let s_source = plan.split(ts_size, count);
					return _.reduce(s_source, (vv, part, index) => {
						vv[index] = vv[index] || {};
						vv[index][property] = part.serialize();
						//@HACK appliable only for plans
						vv[index]['ticket'] = vv[index]['ticket'] || {};
						let tick = {
							time_descripton: vv[index][property][0].data,
							service: service_id,
							operator: op_id,
							dedicated_date: params.query.date,
							priority: 0,
							state: 0
						};
						_.assign(vv[index]['ticket'], tick);
						return vv;
					}, result);
				}, []);
				return complete;
			});
	}
	set(keys, value) {
		let plans_path = ['<namespace>content', 'plan'];
		let result = _.reduce(keys, (status, box_id) => {
			//serialization hack
			if(box_id == 'key')
				return status;
			let box = value[box_id];
			let resolve_params = box.resolve_params;
			let saving = _.reduce(this.ingredients, (result, ingredient, index) => {
				let atom = ingredient.getAtom(plans_path);
				result[index] = atom.resolve({
						query: resolve_params,
						options: {}
					})
					.then((resolved) => {
						resolved.reserve(resolve_params);
						return atom.save(resolved);
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
				return result;
			}, {});
			status[box_id] = Promise.props(saving)
				.then((saved) => {
					if(_.keys(saved).length != _.filter(saved, (val) => !!val).length)
						return false;
					let ticket = {};
					ticket.key = 'ticket-' + uuid.v1();
					ticket.service = resolve_params.service_id;
					ticket.operator = resolve_params.operator_id;
					ticket.state = 0;
					ticket.date = resolve_params.date;
					ticket.time_descripton = resolve_params.selection;
					return this.storage_accessor.set(ticket);
				})
				.catch((err) => {
					console.error(err.stack);
					return false;
				});
			return status;
		}, {});
		return Promise.props(result);
	}
}

module.exports = TSFactoryDataProvider;