'use strict'
//utility
let keymakers = require("./keymakers");
let base_dir = "../../../";

//Model
let TypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/Ticket');
let DecoModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/LDEntity');
//Atomics
let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');
//DP
let CouchbirdLinkedDataProvider = require(base_dir + '/build/externals/CouchbirdLinkedDataProvider');
//accessor
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor');
//parent
let IrisApi = require("./IrisApi");

class TicketApi extends IrisApi {
	constructor() {
		super();
	}

	initContent() {
		let dp = new CouchbirdLinkedDataProvider(this.db);
		let translator = (prop) => {
			return "iris://vocabulary/domain#" + _.camelCase("has_" + prop);
		};
		let storage_data_model = {
			type: {
				type: 'Ticket',
				deco: 'LDEntity',
				params: translator
			},
			deco: 'BaseCollection',
			params: 'ticket_id'
		};
		let Model = DecoModel.bind(DecoModel, TypeModel, translator);

		let storage_accessor = new LDAccessor(dp);

		storage_accessor.keymaker('set', (data) => {
				let tickets = _.isArray(data) ? data : [data];
				let res = _.map(tickets, (t_data) => {
					let ticket = new Model();
					ticket.build(t_data);
					return ticket;
				});
				//@TODO: some checks?
				return keymakers.ticket.set(res);
			})
			.keymaker('get', (data) => {
				let res = data;
				if(data.query) {
					let ticket = new Model();
					ticket.build(data.query);
					res.query = ticket.getAsQuery();
				}
				//@TODO: some checks?
				return keymakers.ticket.get(res);
			});

		let storage = AtomicFactory.create('BasicAsync', {
			type: storage_data_model,
			accessor: storage_accessor
		});
		//@NOTE: actually not content, but atomic
		this.content = storage;
		return this;
	}

	getContent() {
		return this.content;
	}

	getTicket(query, factory_params = {}) {
		return this.content.resolve(query)
			.then((res) => {
				return res.serialize();
			});
	}

	setTicket(ticket_data) {
		return this.content.save(ticket_data);
	}

}

module.exports = TicketApi;