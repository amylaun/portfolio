// Toolkit
var gulp = require('gulp');
var yargs = require('yargs');
var cp = require('child_process');

// Plugins
var $ = require('gulp-load-plugins')();

// Production Check
var PRODUCTION = !!(yargs.argv.production);

// Path Variables
const paths = {
          scss: [ '_sass/*.scss', '_sass/**/* .scss', '_sass/**/**/*.scss'],
          jekyll: ['index.html', '_includes/*', '_layouts/*', '_projects/*', 'assets/*', 'assets/**/*']
      };


// Compile sass to css
gulp.task('compile-sass', () => {
    return gulp.src(paths.scss)
    .pipe(
        $.sourcemaps.init()
    )
    .pipe(
        $.sass({
            includePaths: paths.scss,
            outputStyle: 'compressed'
        }).on('error', $.sass.logError)
    )
    .pipe(
        $.autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9']
        })
    )
    .pipe(
        $.if(
            PRODUCTION, $.cssnano()
        )
    )
    .pipe(
        $.if(
            !PRODUCTION, $.sourcemaps.write()
        )
    )
    .pipe(
        $.rename({
            dirname: './assets/css'
        })
    )
    .pipe(
        gulp.dest('./')
    );
});

// Rebuild Jekyll
gulp.task('build-jekyll', (code) => {
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
        .on('close', code);
})

// Setup Server
gulp.task('server', () => {
    $.connect.server({
        root: ['_site'],
        port: 4000
    });
})

// Watch files
gulp.task('watch', () => {
    gulp.watch(paths.scss, ['compile-sass']);
    gulp.watch(paths.jekyll, ['build-jekyll']);
});

// Start Everything with the default task
gulp.task('default', [ 'compile-sass', 'build-jekyll', 'server', 'watch' ]);
