module.exports = {
	initializer: require("./IrisApi").init,
	BookingApi: require("./BookingApi"),
	UserInfoApi: require("./UserInfoApi"),
	TicketApi: require("./TicketApi"),
	EmployeeApi: require("./EmployeeApi"),
	WorkstationApi: require("./WorkstationApi"),
	HistoryApi: require("./HistoryApi")
};