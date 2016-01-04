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
		let workplaces = _.isArray(data) ? data : [data];
		let opts = {};
		let access = _.map(workplaces, (item) => {
			let workplace = item.dbSerialize();
			console.log(require('util').inspect(workplace, {
				depth: null
			}));
			//cas
			let cas = workplace.cas;
			if(cas) {
				if(cas) {
					delete workplace.cas;
					opts[workplace['@id']] = {
						cas: cas
					};
				}
			}
			return workplace;
		});
		return {
			values: access,
			options: opts
		};
	}
};