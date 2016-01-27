'use strict'

//utility
let base_dir = "../../../";

//parent
let CommonApi = require("./CommonApi");

class WorkstationApi extends CommonApi {
	constructor() {
		super();
	}

	initContent() {
		super.initContent('Workstation');
		super.initContent('Terminal');
		super.initContent('RoomDisplay');
		return this;
	}

	getWorkstation(query) {
		let type = query.keys ? false : 'Workstation';
		return super.getEntry(type, query);
	}
	setWorkstationField(query, assignment, concat = false) {
		let type = query.keys ? false : 'Workstation';

		return super.setEntryField(type, query, assignment, concat);
	}
	setWorkstation(data) {
		return super.setEntry('Workstation', data);
	}
}

module.exports = WorkstationApi;