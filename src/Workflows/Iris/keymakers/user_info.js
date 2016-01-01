module.exports = {
	set: (q) => {
		let access = [];
		_.map(_.values(q), (val) => {
			let node = val.db_data;
			delete val.key;
			delete val.cas;
			delete val.db_data;
			access.push(node);
		})

		return access;
	},
	get: (q) => {
		//here should be a query
		let key = "iris://data#user_info-" + q.phone;
		return q;
	}
};