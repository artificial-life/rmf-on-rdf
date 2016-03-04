'use strict'

//parent
let CommonApi = require("./CommonApi");

let default_agents = "cached_agents";

class AgentApi extends CommonApi {
	constructor() {
		super();
	}


	initContent() {
		super.initContent('Employee');
		super.initContent('Membership');
		super.initContent('SystemEntity');
		return this;
	}

	// updateAgentsCache() {
	// 	return this.getAllEntries({})
	// 		.then((res) => {
	// 			let agents = ["SystemEntity", "Employee"];
	// 			let to_set = _.flatMap(agents, (val) => {
	// 				let ag = res[val];
	// 				return _.map(ag, "@id");
	// 			});
	// 			return this.db.upsert(default_agents, to_set);
	// 		})
	// }

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

	getActiveEmployees() {
		return this.getEmployee({
			query: {
				state: 'active'
			}
		});
	}
}

module.exports = AgentApi;
