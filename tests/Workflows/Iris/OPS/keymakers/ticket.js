'use strict'
module.exports = {
	get: (p) => {
		let keys = (_.isArray(p.id)) ? p.id : [p.id];

		let params_map = {
			operator_id: "iris://vocabulary/domain#hasOperator",
			service_id: "iris://vocabulary/domain#hasService",
			state: "iris://vocabulary/domain#hasState"
		};

		let where = _.reduce(params_map, (acc, val, key) => {
			if(p[key]) {
				acc[val] = p[key];
			}
			return acc;
		}, {});


		where["@type"] = "iris://vocabulary/domain#Ticket";

		console.log("WHERE", where, p);

		let date_map = {
			booking_date: "iris://vocabulary/domain#hasBookingDate",
			dedicated_date: "iris://vocabulary/domain#hasDedicatedDate"
		};
		let test = (data, query) => {
			return _.reduce(date_map, (acc, val, key) => {
				if(!p[key]) return acc;
				return acc && ((new Date(p[key])).toLocaleDateString() == (new Date(data[val][0]['@value']).toLocaleDateString()));
			}, true);
		}

		if(p.id == '*') {
			let query = {
				type: 'view',
				query: {
					tickets: {
						select: "@id",
						where: where,
						test: test
					}
				},
				final: (query) => {
					return query.tickets;
				}
			};

			return query;
		}
		return keys;
	},
	set: (data) => {
		let tickets = _.isArray(data) ? data : [data];
		return _.map(tickets, (ticket) => {
			let node = {};
			node['@id'] = "iris://data#" + ticket.key;
			//@TODO update the vocab with this
			node['@type'] = "iris://vocabulary/domain#Ticket";
			node["iris://vocabulary/domain#hasService"] = [{
				'@id': ticket.service
			}];
			node["iris://vocabulary/domain#hasOperator"] = [{
				'@id': ticket.operator
			}];
			node["iris://vocabulary/domain#hasState"] = ticket.state;
			node["iris://vocabulary/domain#hasBookingDate"] = (new Date()).toUTCString();
			node["iris://vocabulary/domain#hasDedicatedDate"] = ticket.date;
			node["iris://vocabulary/domain#hasTimeDescription"] = JSON.stringify(ticket.time_descripton);
			return node;
		});
	}
};