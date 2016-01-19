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
		let picker = _.isEmpty(query.operator) ? query.alt_operator : query.operator;
		let cnt = query.service_count || 1;
		let ops = _.reduce(_.pick(sources, picker), (acc, op_s, op_id) => {
			if(op_s[query.service]) {
				acc[op_id] = op_s[query.service];
				acc[op_id].plan_of = op_id;
			}
			return acc;
		}, {});

		let ordered = _.sortBy(ops, (plan, op_id) => {
			return _.find(plan.sort().getContent(), (ch) => {
				return(ch.getState().haveState('a'));
			}).start;
		});
		// console.log("OPS", require('util').inspect(ordered, {
		// 	depth: null
		// }));
		//to resolve this crap
		let time_description = false;
		let service = query.service;
		let operator = false;

		let res = _.find(ordered, (src) => {
			let first = _.find(src.sort().getContent(), (ch) => {
				return(ch.getState().haveState('a'));
			});

			//@TODO temporary. Try to make LDPlan like a Fieldset and get this fields directly
			operator = src.plan_of;
			let interval = query.time_description * cnt;
			time_description = [first.start, first.start + interval];
			return(first.getLength() > interval);
		});
		return {
			source: res,
			params: {
				time_description: time_description,
				operator: operator,
				service: service
			}
		};
	}

	resolvePlacing(tickets, sources, set_data = false) {
		let remains = sources;
		let ordered = _.orderBy(tickets, ['priority', (tick) => {
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
			console.log("TICK", /*ticket,*/ operator, service, time_description /*, plan*/ );
			if(!plan) {
				return false;
			}
			if(set_data) {
				ticket.time_description = time_description;
				ticket.operator = operator;
				ticket.service = service;
				//@FIXIT
				ticket.source = plan.parent.db_data['@id'];
			}
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
				return this.resolvePlacing(_.values(tickets.serialize()), plans);
			});
	}

	get(params) {
		// console.log("PARAMS", require('util').inspect(params, {
		// 	depth: null
		// }));
		return this.placeExisting(params)
			.then(({
				remains, placed, lost
			}) => {
				// console.log("OLD TICKS PLACED", require('util').inspect(lost, {
				// 	depth: null
				// }));
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
							dedicated_date: params.selection.ldplan.dedicated_date,
							service: s_id,
							service_count: params.selection.ldplan.service_count
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
	saveTicket(params, to_place, to_remove = {}) {
		let complete = _.reduce(this.ingredients, (result, ingredient, key) => {
			let pre_clean = (to_remove.id) ? this.ingredients[key].free(to_remove) : Promise.resolve(true);
			result[key] = pre_clean.then((res) => {
				if(!res)
					return false;
				return this.ingredients[key].set(params, to_place);
			});
			return result;
		}, {});
		return Promise.props(complete)
			.then((saved) => {
				if(!_.every(saved))
					return false;
				let tick = to_place;
				tick.source = saved.ldplan[tick.id];
				return this.storage_accessor.save(tick)
					.catch((err) => {
						console.log(err.stack);
						return false;
					});
			});
	}

	set(params, value) {
		// console.log("SETTING", require('util').inspect(params, {
		// 	depth: null
		// }));
		let new_tickets = this.finalizer(value);
		if(params.reserve) {
			let keys = _.map(new_tickets, 'id');
			return this.storage_accessor.resolve({
					keys
				})
				.then((tickets) => {
					let prev_set = _.keyBy(tickets.serialize(), 'id');
					let next_set = _.keyBy(new_tickets, 'id');
					let to_free = {};
					let to_reserve = _.mergeWith(prev_set, next_set, (objValue, srcValue, key, obj, src) => {
						if(key === "time_description" && _.isArray(objValue) && _.size(objValue) == 2 && obj.source) {
							console.log(objValue, srcValue);
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
							console.log(res);
							let placed = {};
							let lost = {};
							_.map(res, (val, key) => {
								(val ? placed : lost)[key] = val;
							});
							return {
								placed, lost
							};
						});
				});
		}
		return this.placeExisting(params)
			.then(({
				remains, placed, lost
			}) => {
				if(_.size(lost) > 0) {
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
				return Promise.props({
					placed: this.storage_accessor.save(placed_new),
					lost: lost_new
				});
			});
	}
}

module.exports = TSFactoryDataProvider;