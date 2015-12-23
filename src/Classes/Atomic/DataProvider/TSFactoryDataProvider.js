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
					let op_id = _.sample(_.keys(intersected));
					let source = _.reduce(intersected[op_id].content, (acc, plan, s_id) => {
						acc[s_id] = plan.split(ts_size, count);
						return acc;
					}, {});

					return _.reduce(source, (acc, s_source, s_key) => {
						acc[s_key] = _.reduce(s_source, (vv, part, index) => {
							let query = {
								operator_id: op_id,
								day: params.query.day
							};
							// let query = {};
							vv[index] = vv[index] || {};
							vv[index][property] = part.serialize();
							//@HACK appliable only for plans
							query.selection = vv[index][property][0].data;
							vv[index].resolve_params = query;
							return vv;
						}, {});
						return acc;
					}, result);
				}, {});
				return complete;
			});
	}
	set(keys, value) {
		let plans_path = ['<namespace>content', 'plan'];
		let result = _.reduce(keys, (status, [s_id, box_id]) => {
			//serialization hack
			if(box_id == 'key')
				return status;
			let box = value[s_id][box_id];
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
					ticket.service = s_id;
					ticket.operator = resolve_params.operator_id;
					ticket.state = 0;
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