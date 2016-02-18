'use strict'

let uuid = require('node-uuid');

class TSFactoryDataProvider {
	constructor() {
		this.ingredients = {};
		this.storage_accessor = null;
		this.addFinalizer((data) => {
			return data;
		});
		this.addOrder((data) => {
			return data;
		});
	}

	addFinalizer(fn) {
		this.finalizer = fn;
		return this;
	}

	addOrder(fn) {
		this.order = fn;
		return this;
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
		let picker = _.isEmpty(query.operator) ? query.alt_operator : query.operator;
		// console.log("PICKER", picker, query);
		let cnt = query.service_count || 1;
		let ops = _.reduce(_.pick(sources, picker), (acc, op_s, op_id) => {
			if (op_s[query.service]) {
				acc[op_id] = op_s[query.service].parent.intersection(op_s[query.service]);
			}
			return acc;
		}, {});

		// console.log("OPS", require('util')
		// 	.inspect(ops, {
		// 		depth: null
		// 	}));
		let ordered = _.sortBy(ops, (plan, op_id) => {
			let ch = _.find(plan.sort()
				.getContent(), (ch) => {
					return (ch.getState()
						.haveState('a'));
				});
			return ch ? ch.start : Infinity;
		});

		//to resolve this crap
		let time_description = false;
		let service = query.service;
		let operator = false;

		let res = _.find(ordered, (src) => {
			let first = _.find(src.sort()
				.getContent(), (ch) => {
					return (ch.getState()
						.haveState('a'));
				});
			if (!first) return false;
			//@TODO temporary. Try to make LDPlan like a Fieldset and get this fields directly
			operator = src.parent.owner;
			let interval = query.time_description * cnt;
			time_description = [first.start, first.start + interval];
			return (first.getLength() > interval);
		});
		return {
			source: res,
			time_description,
			operator,
			service
		};
	}


	resolvePlacing(tickets, sources, set_data = false) {
		let remains = sources;
		let ordered = this.order(tickets);
		let ops_by_service = _.reduce(remains, (acc, val, key) => {
			_.map(_.keys(val), (s_id) => {
				acc[s_id] = acc[s_id] || [];
				acc[s_id].push(key);
			});
			return acc;
		}, {});
		let [placed, lost] = _.partition(ordered, (ticket) => {
			ticket.alt_operator = (ticket.alt_operator) || ops_by_service[ticket.service];
			// console.log("OPS_BY_SERV", ops_by_service);
			let {
				source: plan,
				time_description,
				operator,
				service
			} = this.getNearestSource(sources, ticket);
			// console.log("TICK", ticket, operator, service);
			// console.log("PLAN", time_description, plan);
			if (!plan) {
				return false;
			}
			if (set_data) {
				ticket.time_description = time_description;
				ticket.operator = operator;
				ticket.service = service;
				//@FIXIT
				ticket.source = plan.id || plan.parent.id;
			}
			plan.reserve([time_description]);
			return true;
		});
		return {
			remains,
			placed,
			lost
		};
	}

	placePrebook(tickets, sources, set_data = false) {
		let remains = sources;
		let ordered = this.order(tickets);
		let ops_by_service = _.reduce(remains, (acc, val, key) => {
			_.map(_.keys(val), (s_id) => {
				acc[s_id] = acc[s_id] || [];
				acc[s_id].push(key);
			});
			return acc;
		}, {});
		let [placed, lost] = _.partition(ordered, (ticket) => {
			ticket.alt_operator = (ticket.alt_operator) || ops_by_service[ticket.service];
			// console.log("OPS_BY_SERV", ops_by_service);
			let picker = _.isEmpty(ticket.operator) ? ticket.alt_operator : ticket.operator;
			let cnt = ticket.service_count || 1;
			let service = ticket.service;
			let ops = _.reduce(_.pick(remains, picker), (acc, op_s, op_id) => {
				if (op_s[service]) {
					acc[op_id] = op_s[service].parent.intersection(op_s[service]);
				}
				return acc;
			}, {});

			// console.log("OPS", require('util')
			// 	.inspect(ops, {
			// 		depth: null
			// 	}));

			let time_description = ticket.time_description;
			let operator = false;

			let plan = _.find(ops, (src) => {
				operator = src.parent.owner;
				return !!src.reserve([time_description]);
			});

			// console.log("TICK", ticket, operator, service);
			// console.log("PLAN", time_description, plan);
			if (!plan) {
				return false;
			}
			if (set_data) {
				ticket.operator = operator;
				ticket.source = plan.id || plan.parent.id;
			}
			return true;
		});
		return {
			remains,
			placed,
			lost
		};
	}

	getAllSpace(params) {
		let ingredients = _.reduce(this.ingredients, (result, ingredient, property) => {
			result[property] = ingredient.get(params);
			return result;
		}, {});
		return Promise.props(ingredients);
	}

	getAllTickets(params) {
		let query = {
			query: {
				dedicated_date: params.dedicated_date,
				state: ['registered', 'booked']
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
				// console.log("PLANS", require('util').inspect(plans, {
				// 	depth: null
				// }));
				let [prebook, live] = _.partition(_.values(tickets.serialize()), (tick) => _.isArray(tick.time_description));
				// console.log("PREBOOK, LIVE", prebook, live);
				return Promise.resolve(this.placePrebook(prebook, plans))
					.then(({
						remains,
						placed,
						lost
					}) => {
						return this.resolvePlacing(live, remains);
					});
			});
	}

	get(params) {
		// console.log("PARAMS", require('util').inspect(params, {
		// 	depth: null
		// }));
		return this.placeExisting(params)
			.then(({
				remains,
				placed,
				lost
			}) => {
				// console.log("OLD TICKS PLACED", require('util').inspect(remains, {
				// 	depth: null
				// }));
				if (_.size(lost) > 0) {
					//cannot handle even existing tickets
					//call the police!
					return [];
				}
				let ticket_data = [];

				_.map(params.services, ({
					service: s_id,
					time_description: time_description
				}) => {
					for (let i = 0; i < params.count; i++) {
						ticket_data.push({
							time_description: time_description,
							dedicated_date: params.selection.ldplan.dedicated_date,
							service: s_id,
							service_count: _.parseInt(params.selection.ldplan.service_count)
						});
					}
				});
				let new_tickets = this.finalizer(ticket_data);
				let {
					placed: placed_new
				} = this.resolvePlacing(new_tickets, remains, true);
				// console.log("NEW TICKS PLACED", require('util').inspect(remains, {
				// 	depth: null
				// }));
				return placed_new;
			})
			.catch((err) => {
				console.log("TS ERR", err.stack);
			});

	}
	saveTicket(params, to_place, to_remove = {}) {
		let complete = _.reduce(this.ingredients, (result, ingredient, key) => {
			let pre_clean = (to_remove.id) ? this.ingredients[key].free(params, to_remove) : Promise.resolve(true);
			result[key] = pre_clean.then((res) => {
				if (!res)
					return false;
				return !_.isArray(to_place.time_description) ? Promise.resolve(true) : this.ingredients[key].set(params, to_place);
			});
			return result;
		}, {});
		return Promise.props(complete)
			.then((saved) => {
				if (!_.every(saved))
					return false;
				let tick = to_place;
				tick.source = saved.ldplan[tick.id];
				// console.log("TICK SV", tick, saved);
				return this.storage_accessor.save(tick)
					.catch((err) => {
						console.log(err.stack);
						return false;
					});
			});
	}

	set(params, value) {
		let new_tickets = this.finalizer(value);
		// console.log("SETTING", params, require('util').inspect(new_tickets, {
		// 	depth: null
		// }));
		if (params.reserve) {
			let keys = _.map(new_tickets, 'id');
			return this.storage_accessor.resolve({
					keys
				})
				.then((tickets) => {
					let prev_set = _.keyBy(tickets.serialize(), 'id');
					let next_set = _.keyBy(new_tickets, 'id');
					let to_free = {};
					let to_reserve = _.mergeWith(prev_set, next_set, (objValue, srcValue, key, obj, src) => {
						if (key === "time_description" && _.isArray(objValue) && _.size(objValue) == 2 && obj.source) {
							to_free[src.id] = _.cloneDeep(obj);
							return srcValue;
						}
					});
					let placing = _.reduce(to_reserve, (acc, tick, key) => {
						acc[key] = this.saveTicket(params, tick, to_free[key] || {});
						return acc;
					}, {});

					return Promise.props(placing)
						.then((res) => {
							let placed = {};
							let lost = {};
							_.map(res, (val, key) => {
								(val ? placed : lost)[key] = val;
							});
							return {
								placed,
								lost
							};
						});
				});
		}
		///tick confirm
		return this.placeExisting(params)
			.then(({
				remains,
				placed,
				lost
			}) => {
				if (_.size(lost) > 0) {
					return Promise.props({
						placed: [],
						lost: new_tickets
					});
				}
				let {
					placed: placed_new,
					lost: lost_new,
					remains: remains_new
				} = this.resolvePlacing(new_tickets, remains);
				// console.log("NEW", require('util').inspect(new_tickets, {
				// 	depth: null
				// }));
				return Promise.props({
					placed: this.storage_accessor.save(placed_new),
					lost: lost_new
				});
			});
	}
}

module.exports = TSFactoryDataProvider;
