module.exports = {
	template: {
		type: () => "schedule",
		id: (id) => {
			return id.split('--')[0];
		}
	},
	typecast: "Plan"
};