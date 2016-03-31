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

	getSource(sources, query) {
		let picker = _.castArray(query.operator || query.alt_operator);
		// console.log("PICKER", picker, query);
		let cnt = query.service_count > 0 ? query.service_count : 1;
		let ops = _.reduce(_.pick(sources, picker), (acc, op_s, op_id) => {
			if (op_s[query.service]) {
				acc[op_id] = op_s[query.service].parent.intersection(op_s[query.service]);
				acc[op_id].owner = op_id;
			}
			return acc;
		}, {});

		// console.log("OPS", require('util')
		// 	.inspect(ops, {
		// 		depth: null
		// 	}));
		let operator = false;
		let time_description = _.isArray(query.time_description) ? query.time_description : false;
		let source;

		if (time_description) {
			source = _.find(ops, (src) => {
				operator = src.owner || src.parent.owner;
				return !!src.reserve([time_description]);
			});
		} else {
			let ordered = _.sortBy(ops, (plan, op_id) => {
				let ch = _.find(plan.sort()
					.getContent(), (ch) => {
						return (ch.getState()
							.haveState('a'));
					});
				return ch ? ch.start : Infinity;
			});


			source = _.find(ordered, (src) => {
				// console.log("SEARCHING SRC", src.parent.id || src.id);
				let interval = query.time_description * cnt;
				let first = _.find(src.sort()
					.getContent(), (ch) => {
						// console.log("SEARCHING FOR START CHUNK", ch.getStateString(), ch.start, ch.end, ch.getLength(), interval);
						return (ch.getState()
							.haveState('a')) && (ch.getLength() >= interval);
					});
				if (!first) return false;
				time_description = [first.start, first.start + interval];
				operator = src.owner || src.parent.owner;

				return !!src.reserve([time_description]);
			});
		}
		return {
			source,
			time_description,
			operator
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
		let placed = [];
		let lost = [];
		_.map(ordered, (ticket) => {
			ticket.alt_operator = ticket.alt_operator && !_.isEmpty(ticket.alt_operator) ? _.castArray(ticket.alt_operator) : ops_by_service[ticket.service];
			// console.log("OPS_BY_SERV", ops_by_service);
			let {
				source,
				time_description,
				operator
			} = this.getSource(sources, ticket);
			// console.log("TICK", ticket, operator);
			// console.log("PLAN", time_description, source);
			if (!source) {
				lost.push(ticket);
				return true;
			}
			if (set_data) {
				ticket.time_description = time_description;
				ticket.operator = operator;
				//@FIXIT
				ticket.source = source.id || source.parent.id;
			}
			placed.push(ticket);
			return true;
		});
		return {
			remains,
			placed,
			lost
		};
	}


	placeExisting(params) {
		return Promise.props({
				space: Promise.props(_.reduce(this.ingredients, (result, ingredient, property) => {
					result[property] = ingredient.get(params);
					return result;
				}, {})),
				tickets: this.storage_accessor.resolve({
					query: {
						dedicated_date: params.selection.ldplan.dedicated_date,
						org_destination: params.selection.ldplan.organization,
						state: ['registered', 'booked']
					},
					options: {}
				})
			})
			.then(({
				space: {
					ldplan: plans
				},
				tickets
			}) => {
				// console.log("EXISTING TICKS", _.values(tickets.serialize()));
				return this.resolvePlacing(_.values(tickets.serialize()), plans, true);
			});
	}

	get(params) {
		// console.log("PARMAS", require('util')
		// 	.inspect(params, {
		// 		depth: null
		// 	}));
		return this.placeExisting(params)
			.then(({
				remains,
				placed,
				lost
			}) => {
				// console.log("PLACED", require('util')
				// 	.inspect(placed, {
				// 		depth: null
				// 	}));
				// console.log("OLD TICKS PLACED", require('util')
				// 	.inspect(remains, {
				// 		depth: null
				// 	}));
				let td = params.selection.ldplan.time_description;
				let [out_of_range, lost_old] = _.partition(lost, (tick) => {
					return _.isArray(tick.time_description) && (tick.time_description[0] < td[0] || tick.time_description[1] > td[1]);
				});
				let ticket_data = [];
				if (!_.isEmpty(lost)) {
					console.log("-------------------------------------------------------------------------------------------------------");
					console.log("LOST", lost);
					console.log("-------------------------------------------------------------------------------------------------------");
				}
				if (params.existing_only)
					return placed;

				_.map(params.services, ({
					service: s_id,
					time_description
				}) => {
					for (let i = 0; i < params.count; i++) {
						ticket_data.push({
							time_description,
							dedicated_date: params.selection.ldplan.dedicated_date,
							service: s_id,
							service_count: _.parseInt(params.selection.ldplan.service_count)
						});
					}
				});
				let new_tickets = this.finalizer(ticket_data);
				let {
					placed: placed_new,
					lost: lost_new,
					remains: remains_new
				} = this.resolvePlacing(new_tickets, remains, true);
				// console.log("NEW TICKS PLACED", require('util')
				// 	.inspect(remains_new, {
				// 		depth: null
				// 	}));
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
				if (!_.isArray(to_place.time_description)) {
					_.unset(tick, 'operator');
					_.unset(tick, 'destination');
				}
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
		// console.log("SETTING", params, require('util')
		// 	.inspect(new_tickets, {
		// 		depth: null
		// 	}));
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
				let td = params.selection.ldplan.time_description;
				let method = params.selection.ldplan.method;
				let date = params.selection.ldplan.dedicated_date;
				let org = params.selection.ldplan.organization;
				date = _.isString(date) ? date : date.format("YYYY-MM-DD");
				let [out_of_range, lost_old] = _.partition(lost, (tick) => {
					return _.isArray(tick.time_description) && (tick.time_description[0] < td[0] || tick.time_description[1] > td[1]);
				});
				// console.log("NEWTICKS", new_tickets, lost_old);
				let old_placed = _.isEmpty(lost_old);
				if (!_.isEmpty(lost)) {
					console.log("-------------------------------------------------------------------------------------------------------");
					console.log("LOST", lost);
					console.log("-------------------------------------------------------------------------------------------------------");
				}
				let {
					placed: placed_new,
					lost: lost_new,
					remains: remains_new
				} = this.resolvePlacing(new_tickets, remains);
				let all_placed = _.concat(placed, placed_new);
				let all_lost = lost_new;

				//feeling ashamed
				//@FIXIT
				let stats;
				// console.log("STATS____________________________________________________________________________________________________________");
				if (params.quota_status) {
					let services = _.uniq(_.flatMap(remains_new, _.keys));
					// console.log("SERV", services, params.selection.ldplan.dedicated_date.format("YYYY-MM-DD"));
					stats = _.reduce(services, (acc, service) => {
						let plans = _.map(remains_new, (op_plans, op_id) => {
							let p = _.get(op_plans, `${service}`, false);
							return p ? p.parent.intersection(p)
								.defragment() : p;
						});
						// console.log("PLAN", require('util')
						// 	.inspect(plans, {
						// 		depth: null
						// 	}));
						let available = {};
						available[method] = _.reduce(plans, (acc, plan) => {
							return plan ? (acc + plan.getLength()) : acc;
						}, 0);
						let max_available = {};
						max_available[method] = _.reduce(remains_new, (acc, op_plans, op_id) => {
							let plan = _.get(op_plans, `${ service }`, false);
							return plan ? acc + plan.getLength() : acc;
						}, 0);
						let reserved = _.reduce(all_placed, (acc, tick) => {
							if (_.isArray(tick.time_description))
								acc += (tick.time_description[1] - tick.time_description[0]);
							return acc;
						}, 0);
						let max_solid = {};
						max_solid[method] = _.max(_.map(plans, (plan) => plan ? plan.getMaxChunk() : 0)) || 0;
						let plan_stats = {
							max_available,
							available,
							reserved,
							max_solid
						};
						_.set(acc, `${org}.${service}.${date}`, plan_stats);
						return acc;
					}, {});
					// console.log("NEW", require('util')
					// 	.inspect(stats, {
					// 		depth: null
					// 	}));
				}


				return Promise.props({
					placed: this.storage_accessor.save(placed_new),
					out_of_range,
					lost: all_lost,
					stats
				});
			});
	}
}

module.exports = TSFactoryDataProvider;
