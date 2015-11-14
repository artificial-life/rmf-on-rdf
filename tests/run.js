'use strict'
var gulp = require("gulp");
var mocha = require('gulp-mocha');

gulp.src('build/**/*.test.js', {
    read: false
  })
  .pipe(mocha());


global._base = process.cwd();
global.expect = require('chai').expect;
global._ = require('lodash');
global.DogeError = require('./externals/Error/DogeError.js');