'use strict'

let uuid = require('node-uuid');

class TSFactoryDataProvider {
	constructor() {
		this.ingredients = {};
		this.storage_accessor = null;
		this.finalizer = (data) => {
			return data;
		};
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
		console.log("OPS", require('util').inspect(ops, {
			depth: null
		}));
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
		let data = tickets;
		let remains = sources;
		let ordered = _.sortByOrder(data, ['priority', (tick) => {
			return(new Date(tick.booking_date)).getTime();
		}], ['desc', 'asc']);
		// console.log("ORDERED", require('util').inspect(ordered, {
		// 	depth: null
		// }));
		_.map(ordered, (ticket) => {
			let {
				source: plan,
				params: {
					time_description: time_description,
					operator: operator,
					service: service
				}
			} = this.getNearestSource(sources, ticket);
			console.log("TICK", ticket, operator, service, time_description);
			let pre = remains[operator][service];
			remains[operator][service] = plan.reserve([time_description]).intersection(pre);
		});
		// console.log("NEAREST", require('util').inspect(remains, {
		// 	depth: null
		// }));
		return remains;
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

	get(params) {
		console.log("PARAMS", require('util').inspect(params, {
			depth: null
		}));
		//need to return boxes per services with alt operators
		//get all available space
		//get all existing tickets
		let prepare = {
			space: this.getAllSpace(params),
			tickets: this.getAllTickets({
				dedicated_date: params.selection.ldplan.dedicated_date
			})
		};
		return Promise.props(prepare)
			.then(({
				space: {
					ldplan: plans
				},
				tickets: tickets
			}) => {
				// console.log("PLANS", require('util').inspect(plans, {
				// 	depth: null
				// }));
				// console.log("TICKETS", require('util').inspect(tickets.serialize(), {
				// 	depth: null
				// }));
				//place them on available space
				//get remaining space
				let remains = this.resolvePlacing(_.values(tickets.serialize()), plans);
				console.log("REMAINS", require('util').inspect(remains, {
					depth: null
				}));
				//construct new tickets
				// count of tickets per each service
				//try to place them
				let ticket_data = [];
				let ops_by_service = _.reduce(plans, (acc, val, key) => {
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
					let tick = {
						alt_operator: ops_by_service[s_id],
						time_description: time_description,
						service: s_id
					};
					for(let i = 0; i < params.count; i++) {
						ticket_data.push(tick);
					}
				});
				let new_tickets = this.finalizer(ticket_data);
				let placed = this.resolvePlacing(new_tickets, remains);
				console.log("NEW TICKS PLACED", require('util').inspect(placed, {
					depth: null
				}));
			});

		// 		let complete = _.reduce(this.ingredients, (result, ingredient, property) => {
		// 			return ingredient.get(params)
		// 				.then((splitted) => {
		// 					console.log("SPLITTED", require('util').inspect(splitted, {
		// 						depth: null
		// 					}));
		// 					let op_keys = _.keys(splitted);
		// let to_pack = [];
		// 					_.map(splitted, (op_services, op_id)=>{
		// 						_.map(op_services, (op_service, s_id)=> {
		// 							let tick_data = {
		// 								alt_operator : op_keys,
		// 								service: s_id,
		// 								dedicated_date: params.selection[property].dedicated_date,
		// 								time_description: op_service.getContent()[0].serialize().data[0]
		// 							};
		// 							to_pack.push({});
		// 						});
		// 					});
		// 					return _.reduce(s_source, (vv, part, index) => {
		// 						vv[index] = vv[index] || {};
		// 						vv[index][property] = part.serialize();
		// 						//@HACK appliable only for plans
		// 						vv[index].resolve_params = vv[index].resolve_params || {};
		// 						let tick = {}; //params.selection[property];
		// 						_.merge(tick, {
		// 							operator: op_id,
		// 							alt_operator: op_keys,
		// 							service: params.selection[property].service,
		// 							source: part.parent.db_data['@id'],
		// 							time_description: part.getContent()[0].serialize().data[0],
		// 							dedicated_date: params.selection[property].dedicated_date
		// 						});
		// 						vv[index].resolve_params[property] = tick;
		// 						return vv;
		// 					}, result);
		// 				});
		// 			return result;
		// 		}, {});
		// 		return Promise.props(complete);
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