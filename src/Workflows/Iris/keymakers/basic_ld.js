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