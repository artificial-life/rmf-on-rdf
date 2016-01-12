'use strict'

let uuid = require('node-uuid');

class TSFactoryDataProvider {
	constructor() {
		this.ingredients = {};
		this.storage_accessor = null;
		this.addFinalizer((data) => {
			return data;
		});
	}

	addFinalizer(fn) {
		this.finalizer = fn;
	}

	addStorage(accessor) {
		this.storage_accessor = accessor;
		return this;
	}

	addIngredient(ing_name, ingredient) {
		this.ingredients[ing_name] = ingredient;
		return this;
	}

	getNearestSource(sources, query) {
		let ops = _.reduce(_.pick(sources, query.alt_operator), (acc, op_s, op_id) => {
			if(op_s[query.service])
				acc[op_id] = op_s[query.service];
			return acc;
		}, {});
		// console.log("OPS", require('util').inspect(ops, {
		// 	depth: null
		// }));
		let ordered = _.sortBy(ops, (plan, op_id) => {
			plan.op_id = op_id;
			return _.find(plan.sort().getContent(), (ch) => {
				return(ch.getState().haveState('a'));
			}).start;
		});

		//to resolve this crap
		let time_description = false;
		let service = query.service;
		let operator = false;

		let res = _.find(ordered, (src) => {
			let first = _.find(src.sort().getContent(), (ch) => {
				return(ch.getState().haveState('a'));
			});
			//@TODO temporary. Try to make LDPlan like a Fieldset and get this fiels directly
			operator = src.op_id;
			time_description = [first.start, first.start + query.time_description];
			return(first.getLength() > query.time_description);
		});
		// console.log("RES", require('util').inspect(res, {
		// 	depth: null
		// }));

		return {
			source: res,
			params: {
				time_description: time_description,
				operator: operator,
				service: service
			}
		};
	}

	resolvePlacing(tickets, sources) {
		let remains = sources;
		let ordered = _.sortByOrder(tickets, ['priority', (tick) => {
			return(new Date(tick.booking_date)).getTime();
		}], ['desc', 'asc']);
		let [placed, lost] = _.partition(ordered, (ticket) => {
			let {
				source: plan,
				params: {
					time_description: time_description,
					operator: operator,
					service: service
				}
			} = this.getNearestSource(sources, ticket);
			// console.log("TICK", /*ticket,*/ operator, service, time_description /*, plan*/ );
			if(!plan)
				return false;
			remains[operator][service] = plan.reserve([time_description]).intersection(remains[operator][service]);
			return true;
		});
		return {
			remains, placed, lost
		};
	}

	getAllSpace(params) {
		let ingredients = _.reduce(this.ingredients, (result, ingredient, property) => {
			result[property] = ingredient.get(params);
			return result
		}, {});
		return Promise.props(ingredients);
	}

	getAllTickets(params) {
		let query = {
			query: {
				dedicated_date: params.dedicated_date,
				state: 0
			},
			options: {}
		};
		return this.storage_accessor.resolve(query);
	}

	placeExisting(params) {
		return Promise.props({
				space: this.getAllSpace(params),
				tickets: this.getAllTickets({
					dedicated_date: params.selection.ldplan.dedicated_date
				})
			})
			.then(({
				space: {
					ldplan: plans
				},
				tickets: tickets
			}) => {
				return this.resolvePlacing(_.values(tickets.serialize()), plans);
			});
	}

	get(params) {
		console.log("PARAMS", require('util').inspect(params, {
			depth: null
		}));
		return this.placeExisting(params)
			.then(({
				remains, placed, lost
			}) => {
				if(_.size(lost) > 0) {
					//cannot handle even existing tickets
					//call the police!
					return [];
				}
				let ticket_data = [];
				let ops_by_service = _.reduce(remains, (acc, val, key) => {
					_.map(_.keys(val), (s_id) => {
						acc[s_id] = acc[s_id] || [];
						acc[s_id].push(key);
					});
					return acc;
				}, {});

				_.map(params.services, ({
					service: s_id,
					time_description: time_description
				}) => {
					for(let i = 0; i < params.count; i++) {
						ticket_data.push({
							alt_operator: ops_by_service[s_id],
							time_description: time_description,
							service: s_id
						});
					}
				});
				let new_tickets = this.finalizer(ticket_data);
				let {
					placed: placed_new
				} = this.resolvePlacing(new_tickets, remains);
				// console.log("NEW TICKS PLACED", require('util').inspect(placed_new, {
				// 	depth: null
				// }));
				return placed_new;
			});

	}

	set(keys, value) {
		console.log("SETTING", require('util').inspect(value, {
			depth: null
		}));
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