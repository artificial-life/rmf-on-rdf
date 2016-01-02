global._base = process.cwd();
global.expect = require('chai').expect;
global._ = require('lodash');
global.DogeError = require('./externals/Error/DogeError.js');
global.Promise = require('bluebird');

module.exports = {
	IrisWorkflow: require('./build/Workflows/Iris/IrisWorkflow.js')
};