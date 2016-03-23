'use strict'

//parent
let CommonApi = require("./CommonApi");

class AgentApi extends CommonApi {
	constructor(cfg = {}) {
		super(cfg);
	}

	cacheActiveAgents() {
		return this.db.N1ql.direct({
				query: `SELECT  \`@id\` as id, \`@type\` as type, \`state\` FROM \`${this.db.bucket_name}\` WHERE ( \`state\`='active' OR \`state\`='paused') ORDER BY type, id ASC`
			})
			.then((res) => {
				return super.setCache('active_agents', [], _.mapValues(_.groupBy(res, 'type'), (vals, type) => _.mapValues(_.groupBy(vals, 'state'), (v, state) => _.map(v, 'id'))));
			});
	}

	getActiveAgents() {
		return super.getCache('active_agents');
	}
	getAgentPermissions() {
		return super.getGlobal('agent_permissions');
	}
	initContent() {
		super.initContent('Employee');
		super.initContent('Spirit');
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
