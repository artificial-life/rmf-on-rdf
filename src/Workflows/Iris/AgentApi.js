'use strict'

//parent
let CommonApi = require("./CommonApi");

let default_membership_description = 'global_membership_description';

class AgentApi extends CommonApi {
	constructor(cfg = {}) {
		super();
		let config = _.merge({
			membership_description: default_membership_description
		}, cfg);
		this.membership_description = config.membership_description;
	}


	initContent() {
		super.initContent('Employee');
		super.initContent('SystemEntity');
		return this;
	}

	getEmployee(query) {
		return super.getEntry('Employee', query);
	}

	setEmployeeField(query, assignment) {
		return super.setEntryField('Employee', query, assignment);
	}

	setEmployee(data) {
		return super.setEntry('Employee', data);
	}

	getActiveEmployees() {
		return this.getEmployee({
			query: {
				state: 'active'
			}
		});
	}
}

module.exports = AgentApi;
