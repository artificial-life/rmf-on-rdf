module.exports = {
	common_id: new RegExp("(.*)#([^-]*)-([^\/]*)"),
	classes: {
		plan: {
			template: {
				type: () => "schedule",
				id: (id) => {
					return id.split('--')[0];
				}
			},
			map_keys: {
				"iris://vocabulary/domain#scheduleOf": "iris://vocabulary/domain#planOf"
			},
			map_values: {
				"iris://vocabulary/domain#hasTimeDescription": function(value) {
					return JSON.parse(value[0]['@value']);
				}
			},
			typecast: "iris://vocabulary/domain#Plan"
		}
	}
};