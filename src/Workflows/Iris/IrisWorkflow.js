'use_strict'

let IrisBuilder = require("./Builder");

//temporary here
//@TODO make all this bullshit in a righteous way
class IrisWorkflow {
	constructor() {}
	init(cfg) {
		IrisBuilder.init(cfg);
		let rs = IrisBuilder.getResourceSource();
		this.factory = IrisBuilder.getFactory({
			'ldplan': rs
		});
	}

	build(query, factory_params = {}) {
		this.factory.selector().reset()
			.add()
			.id('<namespace>builder').id('box').query(query);
		return this.factory.build(factory_params);
	}

	observe(query, factory_params = {}) {
		return this.build(query, factory_params)
			.then((produced) => {
				return produced.observe({
					box_id: query.box_id || '*'
				});
			})
			.then((res) => {
				return res.getAtom(['<namespace>builder', 'box']).serialize();
			});
	}

	reserve(data) {
		return this.factory.getAtom(['<namespace>builder', 'box']).save(data);
	}

	getTicket(query, factory_params = {}) {
		this.factory.selector().reset()
			.add()
			.id('<namespace>content').id('box').query(query);
		return this.factory.build(factory_params)
			.then((res) => {
				return res.getAtom(['<namespace>content', 'box']).serialize();
			});
	}

	setTicket(ticket_data) {
		let ticket = this.factory.buildFinalized(data);
		if(!ticket.isValid())
			return false;
		return res.getAtom(['<namespace>content', 'box']).save(ticket);
	}
}
module.exports = IrisWorkflow;