'use strict'

class UserInfo {
	constructor() {
			this.fields = ["phone", "first_name", "last_name", "middle_name"];
			this.content_map = {};
		}
		//this should be somewhere else
	propertyKeyTransform(prop) {
		return "iris://vocabulary/domain#" + _.camelCase(prop);
	};

	build(data) {

	}
}