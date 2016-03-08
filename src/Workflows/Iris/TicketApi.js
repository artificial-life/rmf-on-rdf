'use strict'
//utility
let base_dir = "../../../";

//parent
let CommonApi = require("./CommonApi");

let default_ticket_priority = 'global_ticket_priority';

class TicketApi extends CommonApi {
	constructor(cfg = {}) {
		super();
		let config = _.merge({
			ticket_priority_registry: default_ticket_priority
		}, cfg);
		this.ticket_priority_registry = config.ticket_priority_registry;
	}

	getTicketPriorities() {
		return this.db.get(this.ticket_priority_registry)
			.then(res => res.value)
			.catch(err => {});
	}

	initContent() {
		super.initContent('Ticket');
		return this;
	}

	getTicket(query) {
		return super.getEntry('Ticket', query);
	}

	setTicketField(query, assignment, concat = false) {
		return super.setEntryField('Ticket', query, assignment, concat);
	}

	setTicket(data) {
		return super.setEntry('Ticket', data)
	}

}

module.exports = TicketApi;
