global._ = require('lodash');
global.DogeError = require('./build/externals/Error/DogeError.js');
global.Promise = require('bluebird');

module.exports = {
	IrisWorkflow: require('./build/Workflows/Iris/IrisWorkflow.js')
};