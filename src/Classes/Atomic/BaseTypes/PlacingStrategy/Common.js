'use strict'
var Strategy = require('./Strategy.js');

var Common = new Strategy();

Common.all((newbee, oldone) => {
	return new Error("Can't place " + newbee.mark + " on " + oldone.mark);
}).except('r=>a', (newbee, oldone) => {
	return oldone.cut(newbee);
}).except('a=>r', (newbee, oldone) => {
	return oldone.cut(newbee);
}).except('r=>r', (newbee, oldone) => {
	let touching = newbee.start == oldone.end || oldone.start == newbee.end;
	return touching ? oldone : new Error('reserved on reserved');
});


module.exports = Common;