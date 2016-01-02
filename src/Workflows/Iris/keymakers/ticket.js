'use strict'
module.exports = {
	get: ({
		query: p,
		keys: ids
	}) => {
		if(ids)
			return {
				keys: ids
			};
		let keys = (_.isArray(p.id)) ? p.id : [p.id];

		//almost the same as in ticket
		let transform_prop = (prop) => {
			return "iris://vocabulary/domain#" + _.camelCase("has_" + prop);
		}
		let fields = ['id', 'source', 'time_description', 'operator', 'alt_operator', 'service', "code", "label", "destination", "booking_date", "dedicated_date", "priority", "state", "user_info", "service_count"];


		let where = _.reduce(fields, (acc, key) => {
			if(p[key]) {
				acc[transform_prop(key)] = p[key];
			}
			return acc;
		}, {});


		where["@type"] = "iris://vocabulary/domain#Ticket";

		// console.log("WHERE", where, p);

		let date_map = {
			booking_date: transform_prop('booking_date'),
			dedicated_date: transform_prop('dedicated_date')
		};
		let test = (data, query) => {
			return _.reduce(date_map, (acc, val, key) => {
				if(!p[key]) return acc;
				return acc && ((new Date(p[key])).toLocaleDateString() == (new Date(data[val][0]['@value']).toLocaleDateString()));
			}, true);
		}

		if(_.isUndefined(p.id) || p.id == '*') {
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

			return {
				query: query
			};
		}
		return {
			keys: keys
		};
	},
	set: (data) => {
		let tickets = _.isArray(data) ? data : [data];
		return _.map(tickets, (item) => {
			let transform_prop = item.propertyKeyTransform;
			let ticket = item.serialize();
			let node = {};
			//vocab
			node['@id'] = "iris://data#" + ticket.id;
			node['@type'] = "iris://vocabulary/domain#Ticket";
			//refs
			node["iris://vocabulary/domain#hasService"] = [{
				'@id': ticket.service
			}];
			node["iris://vocabulary/domain#hasOperator"] = [{
				'@id': ticket.operator
			}];
			node["iris://vocabulary/domain#hasAltOperator"] = _.map(ticket.alt_operator, (op) => {
				return {
					'@id': op
				}
			});
			node["iris://vocabulary/domain#hasDestination"] = [{
				'@id': ticket.destination
			}];
			node["iris://vocabulary/domain#hasSource"] = [{
				'@id': ticket.source
			}];
			//rest
			_.map(ticket, (val, key) => {
				if(key == 'id') return;
				let nkey = transform_prop(key);
				node[nkey] = node[nkey] || val;
			});
			return node;
		});
	}
};