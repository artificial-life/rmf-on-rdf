module.exports = {
	set: (q) => {
		let access = [];
		_.map(_.values(q), (val) => {
			let node = val.dbSerialize();
			delete val.key;
			delete val.cas;
			access.push(node);
		});

		return access;
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