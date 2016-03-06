'use strict'
//utility
let base_dir = "../../../";

//parent
let CommonApi = require("./CommonApi");

class TicketApi extends CommonApi {
	constructor() {
		super();
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
