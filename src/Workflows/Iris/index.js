module.exports = {
	initializer: require("./IrisApi").init,
	BookingApi: require("./BookingApi"),
	UserInfoApi: require("./UserInfoApi"),
	TicketApi: require("./TicketApi"),
	AgentApi: require("./AgentApi"),
	WorkplaceApi: require("./WorkplaceApi"),
	HistoryApi: require("./HistoryApi")
};