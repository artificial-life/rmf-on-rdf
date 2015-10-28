var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var watch = require('gulp-watch');
var changed = require('gulp-changed');
var nodemon = require('gulp-nodemon');
var plumber = require('gulp-plumber');


require('harmonize')();

gulp.task("default", function () {
    return gulp.src("src/**/*.js")
        .pipe(babel({
            blacklist: ['bluebirdCoroutines', 'regenerator']
        }))
        .pipe(gulp.dest("build")).on('end', function () {
            require('./build/index.js');
            setTimeout(function () {
                console.log('timeout');
                process.exit()
            }, 30000);
        });
});

gulp.task("sourcemaps", function () {
    return gulp.src("src/**/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel({
            blacklist: ['bluebirdCoroutines', 'regenerator']
        }))
        .pipe(sourcemaps.write("./maps"))
        .pipe(gulp.dest("build"));
});

gulp.task('serve', ['start'], function () {
    gulp.watch(["src/**/*.js", "tests/**/*.js"], ['es6-ll']);
});


gulp.task('es6-ll', function () {
    return gulp.src(["src/**/*.js", "tests/**/*.js"])
        .pipe(changed("build"))
        .pipe(plumber({
            errorHandler: function (e) {
                console.log('error', e);
            }
        }))
        .pipe(babel({
            blacklist: ['bluebirdCoroutines', 'regenerator']
        }))
        .pipe(gulp.dest("build"))
        .on('end', function () {
            console.log('build');

        });
});

gulp.task('start', function () {
    nodemon({
        script: 'build/run.js',
        ext: 'js',
        env: {
            'NODE_ENV': 'development'
        }
    })
})