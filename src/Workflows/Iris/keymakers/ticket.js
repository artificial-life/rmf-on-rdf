'use strict'
module.exports = {
	get: ({
		query: p,
		keys
	}) => {
		if(keys && !p)
			return {
				keys
			};
		if(!p)
			return {};
		let query = {
			type: 'view',
			query: {
				ids: {
					select: "@id",
					where: p
				}
			},
			final: (query) => {
				return query.ids;
			}
		};
		// console.log("QQ ЗЗ", require('util').inspect(query, {
		// 	depth: null
		// }));
		return {
			query
		};
	},
	set: (data) => {
		let opts = {};
		let access = _.map(data, (ticket) => {
			//cas
			let cas = ticket.cas;
			if(cas) {
				delete ticket.cas;
				opts[ticket['@id']] = {
					cas: cas
				};
			}
			return ticket;
		});
		return {
			values: access,
			options: opts
		};
	}
};