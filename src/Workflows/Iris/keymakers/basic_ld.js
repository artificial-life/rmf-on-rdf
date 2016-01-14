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
				ids: {
					select: "@id",
					where: p
				}
			},
			final: (query) => {
				return query.ids;
			}
		};
		// console.log("QQ", require('util').inspect(query, {
		// 	depth: null
		// }));
		return {
			query: query
		};
	},
	set: (data) => {
		let access = _.map(data, (item) => {
			let entity = item;
			delete entity.cas;
			return entity;
		});

		return access;
	}
};