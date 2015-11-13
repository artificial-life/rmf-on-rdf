'use strict'
var Strategy = require('./Strategy.js');

var Common = new Strategy();

Common.all((newbee, oldone) => {
  return Error("Can't place " + newbee.mark + " on " + oldone.mark);
}).except('r=>a', (newbee, oldone) => {
  return oldone.cut(newbee);
}).except('s=>*', () => true);


module.exports = Common;