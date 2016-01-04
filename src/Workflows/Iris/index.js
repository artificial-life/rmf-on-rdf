module.exports = {
	initializer: require("./IrisApi").init,
	BookingApi: require("./BookingApi"),
	TicketApi: require("./TicketApi"),
	OperatorApi: require("./OperatorApi"),
	WorkplaceApi: require("./WorkplaceApi"),
	HistoryApi: require("./HistoryApi")
};