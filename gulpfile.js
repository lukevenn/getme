var gulp = require ('gulp');
var jslint = require('gulp-jslint');
var uglify = require('gulp-uglify');

gulp.task('default', ['lint'], function () {
    gulp.src('src/getme.js')
        .pipe(uglify())
        .pipe(gulp.dest('min'));
});

gulp.task('lint', function () {
    gulp.src('src/getme.js')
        .pipe(jslint({
            predef: ['window', 'exports', 'define'], // for browser, node and AMD
            todo: true, // just in case :)
            unparam: true // allow unused params to avoid JSDocs errors
        }));
});

gulp.task('dev-lint', function () {
    gulp.src('src/getme.js')
        .pipe(jslint({
            node: true,
            devel: true,
            predef: ['window', 'define'], // for browser and AMD
            todo: true, // just in case :)
            unparam: true // allow unused params to avoid JSDocs errors
        }));
});

gulp.task('node-export', ['lint'], function () {
    gulp.src('src/getme.js')
        .pipe(jslint({
            node: true,
            predef: ['window', 'define'], // for browser and AMD
            todo: true, // just in case :)
            unparam: true // allow unused params to avoid JSDocs errors
        }))
        .pipe(gulp.dest('node_modules/getme'));
    gulp.src('package.json')
        .pipe(gulp.dest('node_modules/getme'));
});
