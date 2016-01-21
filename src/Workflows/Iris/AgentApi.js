'use strict'

//parent
let CommonApi = require("./CommonApi");

class AgentApi extends CommonApi {
	constructor() {
		super();
	}


	initContent() {
		super.initContent('Employee');
		super.initContent('Membership');
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

	getEmployeeRoles(id) {
		return super.getEntry("Membership", {
			query: {
				member: id
			}
		});
	}
}

module.exports = AgentApi;