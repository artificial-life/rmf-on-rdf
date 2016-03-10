'use strict'

//parent
let CommonApi = require("./CommonApi");

let default_membership_description = 'global_membership_description';
let default_agent_permissions = 'global_agent_permissions';
let default_active_agents = 'cache_active_agents';

class AgentApi extends CommonApi {
	constructor(cfg = {}) {
		let config = _.merge({
			membership_description: default_membership_description,
			cache_active_agents: default_active_agents,
			agent_permissions: default_agent_permissions
		}, cfg);
		super({
			startpoint: config
		});
	}

	cacheActiveAgents() {
		return this.db.N1ql.direct({
				query: `SELECT  \`@id\` as id, \`@type\` as type FROM ${this.db.bucket_name} WHERE  \`state\`='active' ORDER BY type, id ASC`
			})
			.then((res) => {
				return this.db.upsert(this.startpoint.cache_active_agents, {
					"@id": this.startpoint.cache_active_agents,
					"@type": "Cache",
					"content": _.mapValues(_.groupBy(res, 'type'), (vals, type) => _.map(vals, 'id'))
				});
			});
	}

	getActiveAgents() {
		return this.db.get(this.startpoint.cache_active_agents)
			.then((res) => res.value)
			.catch(err => {});
	}
	getAgentPermissions() {
		return this.db.get(this.startpoint.agent_permissions)
			.then((res) => res.value.content)
			.catch(err => {});
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
}

module.exports = AgentApi;
