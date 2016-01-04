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

		let query = {
			type: 'view',
			query: {
				tickets: {
					select: "@id",
					where: p
				}
			},
			final: (query) => {
				return query.tickets;
			}
		};

		return {
			query: query
		};
	},
	set: (data) => {
		let tickets = _.isArray(data) ? data : [data];
		let opts = {};
		let access = _.map(tickets, (item) => {
			let ticket = item.dbSerialize();
			//cas
			let cas = ticket.cas;
			if(cas) {
				if(cas) {
					delete ticket.cas;
					opts[ticket['@id']] = {
						cas: cas
					};
				}
			}
			return ticket;
		});
		return {
			values: access,
			options: opts
		};
	}
};