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
				employees: {
					select: "@id",
					where: p
				}
			},
			final: (query) => {
				return query.employees;
			}
		};

		return {
			query: query
		};
	},
	set: (data) => {
		let employees = _.isArray(data) ? data : [data];
		let opts = {};
		let access = _.map(employees, (item) => {
			let employee = item.dbSerialize();
			//cas
			let cas = employee.cas;
			if(cas) {
				if(cas) {
					delete employee.cas;
					opts[employee['@id']] = {
						cas: cas
					};
				}
			}
			return employee;
		});
		return {
			values: access,
			options: opts
		};
	}
};