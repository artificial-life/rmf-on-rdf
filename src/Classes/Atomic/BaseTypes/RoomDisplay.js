'use strict'

let Fieldset = require("./Fieldset");

class RoomDisplay extends Fieldset {
	constructor() {
		let fields = ["id", "default_agent", 'attached_to', "device_type", "device_label", "occupied_by"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent'];
	}
}

module.exports = RoomDisplay;