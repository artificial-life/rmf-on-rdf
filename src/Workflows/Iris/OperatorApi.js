'use strict'

let IrisApi = require("./IrisApi");
let keymakers = require("./keymakers");
let classmap = require("./classmap");
let base_dir = "../../../";

let UserInfo = require(base_dir + '/build/Classes/Atomic/BaseTypes/UserInfo');


class OperatorApi extends IrisApi {
	constructor() {
		super();
	}


}

module.exports = OperatorApi;

// changeState() {}
// login() {}
// logout() {}
// pause() {}
// resume() {}
// getInfo() {}
// getWorkPlace() {}
// defaultWorkPlace() {}
// getAvailableWorkPlaces() {}