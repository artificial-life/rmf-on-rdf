module.exports = {
	set: (query) => {
		let access = _.map(query, (val) => {
			let node = val;
			delete node.cas;
			return node;
		});

		return {
			values: access
		};
	},
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
				ui: {
					select: "@id",
					where: p
				}
			},
			final: (query) => {
				let random_id = 'user_info-' + (require('node-uuid')).v1();
				return _.isEmpty(query.ui) ? random_id : query.ui;
			}
		};

		return {
			query: query
		};
	}
};