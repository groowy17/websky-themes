(function() {
    var gulp = require('gulp'),
        del = require('del'),
        browserSync = require('browser-sync'),
        sass = require('gulp-sass'),
        postcss = require('gulp-postcss'),
        sourcemaps = require('gulp-sourcemaps'),
        autoprefixer = require('autoprefixer'),
        notify = require("gulp-notify"),
        devConfig = require('./package').devConfig,
        theme = (devConfig.theme !== 'websky') ? devConfig.theme + '/' : devConfig.theme; // default theme is "websky"

    gulp.task('clean', function() {
        return del(['build', 'src/css']);
    });

    gulp.task('server', function() {

        browserSync({
            proxy: devConfig.host,
            files: ['build/*.css'],
            middleware: require('serve-static')('build'),
            rewriteRules: [{
                match: new RegExp('</head>'),
                fn: function() {
                    if (theme === 'websky') {
                        return false;
                    } else {
                        return '<link rel="stylesheet" type="text/css" href="/css/' + theme + 'custom.css">';
                    }
                }
            }],
            port: 3030
        });

        gulp.watch('src/sass/**/*.scss', ['sassWithAutoprefix']);

    });

    gulp.task('sassWithAutoprefix', function() {
        if (theme === 'websky') {
            return false;
        } else {
            return gulp.src('src/sass/' + theme + 'custom.scss')
                .pipe(sass({ errLogToConsole: true }).on('error', function(err) {
                    return notify().write(err)
                }))
                .pipe(gulp.dest('src/css/' + theme)) // build css without prefix
                .pipe(notify({
                    title: 'Complete!',
                    message: 'Styles have been compiled'
                }))
                .pipe(sourcemaps.init())
                .pipe(postcss([autoprefixer()]))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest('build/css/' + theme))
                .pipe(browserSync.stream());
        }
    });

    gulp.task('default', ['clean', 'sassWithAutoprefix', 'server']);

}());