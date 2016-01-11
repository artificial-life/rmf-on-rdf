'use strict'

let uuid = require('node-uuid');

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
		//@NOTE only one service so far
		//@FIXIT : flush this monkey code ASAP
		//f*ck I tried to avoid this
		let complete = _.reduce(this.ingredients, (result, ingredient, property) => {
			return ingredient.get(params)
				.then((splitted) => {
					//just pick a random op for now
					let op_keys = _.keys(splitted);
					let op_id = _.sample(op_keys);
					// let alt_ops = _.without(op_keys, op_id);
					let s_source = splitted[op_id];
					//if intersection is empty
					if(!op_id) return result;

					return _.reduce(s_source, (vv, part, index) => {
						vv[index] = vv[index] || {};
						vv[index][property] = part.serialize();
						//@HACK appliable only for plans
						vv[index].resolve_params = vv[index].resolve_params || {};
						let tick = {}; //params.selection[property];
						_.merge(tick, {
							operator: op_id,
							alt_operator: op_keys,
							service: params.selection[property].service,
							source: part.parent.db_data['@id'],
							time_description: part.getContent()[0].serialize().data[0],
							dedicated_date: params.selection[property].dedicated_date
						});
						vv[index].resolve_params[property] = tick;
						return vv;
					}, result);
				});
			return result;
		}, {});
		return Promise.props(complete);
	}

	set(keys, value) {
		let result = _.reduce(keys, (status, box_id) => {
			let box = value[box_id];
			let saving = _.reduce(this.ingredients, (result, ingredient, index) => {
				result[index] = ingredient.set(box_id, box[index]);
				return result;
			}, {});
			status[box_id] = Promise.props(saving)
				.then((saved) => {
					if(_.keys(saved).length != _.compact(_.values(saved)).length)
						return false;
					let ticket_raw =
						_.reduce(saved, (acc, val, key) => {
							_.merge(acc, box[key].resolve_params)
							return acc;
						}, {});
					ticket_raw.id = 'ticket-' + uuid.v1();
					return this.storage_accessor.set(ticket_raw);
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