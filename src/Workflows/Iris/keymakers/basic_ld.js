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
		return {
			values: access
		};
	}
};