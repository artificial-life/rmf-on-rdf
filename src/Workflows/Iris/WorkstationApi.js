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
		return super.getEntry('Workstation', query);
	}
	setWorkstationField(query, assignment) {
		return super.setEntryField('Workstation', query, assignment);
	}
	setWorkstation(data) {
		return super.setEntry('Workstation', data);
	}
}

module.exports = WorkstationApi;