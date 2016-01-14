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
				workplaces: {
					select: "@id",
					where: p
				}
			},
			final: (query) => {
				return query.workplaces;
			}
		};

		return {
			query: query
		};
	},
	set: (data) => {
		let opts = {};
		let access = _.map(workplaces, (workplace) => {
			delete workplace.cas;
			return workplace;
		});
		return {
			values: access,
			options: opts
		};
	}
};