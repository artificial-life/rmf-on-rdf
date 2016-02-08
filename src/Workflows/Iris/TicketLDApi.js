'use strict'
//utility
let base_dir = "../../../";

//parent
let CommonLDApi = require("./CommonLDApi");

class TicketLDApi extends CommonLDApi {
	constructor() {
		super();
	}

	initContent() {
		super.initContent('Ticket', (prop) => ("iris://vocabulary/domain#" + _.camelCase("has_" + prop)));
		return this;
	}

	getTicket(query) {
		return super.getEntry('Ticket', query)
	}

	setTicketField(query, assignment) {
		return super.setEntryField('Ticket', query, assignment);
	}

	setTicket(data) {
		return super.setEntry('Ticket', data)
	}

}

module.exports = TicketLDApi;