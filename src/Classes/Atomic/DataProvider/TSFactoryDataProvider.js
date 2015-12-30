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

	addFinalizedModel(model) {
		this.finalizedModel = model;
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
					let op_id = _.sample(_.keys(splitted));
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
							service: params.selection[property].selection.service_id,
							source: part.parent.db_data['@id'],
							time_description: part.getContent()[0].serialize().data[0],
							dedicated_date: params.selection[property].date
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
		console.log("TSFDP", keys, value);
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
					let FModel = this.finalizedModel;
					let ticket = new FModel();
					ticket.build(ticket_raw);
					if(!ticket.isValid())
						return false;

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