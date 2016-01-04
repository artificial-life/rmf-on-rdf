global._ = require('lodash');
global.DogeError = require('./build/externals/Error/DogeError.js');
global.Promise = require('bluebird');

module.exports = require('./build/Workflows/Iris/');