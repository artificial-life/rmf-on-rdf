module.exports = {
	initializer: require("./IrisApi").init,
	BookingApi: require("./BookingApi"),
	TicketApi: require("./TicketApi"),
	AgentApi: require("./AgentApi"),
	ServiceApi: require("./ServiceApi"),
	WorkstationApi: require("./WorkstationApi"),
	HistoryApi: require("./HistoryApi"),
	AdministratorApi: require("./AdministratorApi")
};