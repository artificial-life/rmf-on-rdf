'use strict'
//utility
let base_dir = "../../../";

//parent
let CommonApi = require("./CommonApi");

let default_priority_description = 'global_priority_description';

class TicketApi extends CommonApi {
	constructor(cfg = {}) {
		let config = _.merge({
			priority_description_registry: default_priority_description
		}, cfg);
		super({
			startpoint: config
		});
	}

	getBasicPriorities() {
		return this.db.get(this.startpoint.priority_description_registry)
			.then(res => res.value.content)
			.catch(err => {});
	}

	getExpiredTickets(now) {
		return this.db.N1ql.direct({
				query: `SELECT  \`@id\` as id FROM ${this.db.bucket_name} WHERE  \`@type\`='Ticket' and \`state\`="booked" and \`expiry\`< ${now} ORDER BY id ASC`
			})
			.then((res) => _.map(res, 'id'))
			.catch(err => []);
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

	sort(tickets) {
		return _.orderBy(tickets, [(tick) => {
			return _.sum(_.map(tick.priority, 'value'));
		}, (tick) => {
			return (new Date(tick.booking_date))
				.getTime();
		}], ['desc', 'asc'])
	}
}

module.exports = TicketApi;
