var fs = require('fs');
var gulp = require('gulp');

var browserSync = require('browser-sync');
var historyApiFallback = require('connect-history-api-fallback');
var ini = require('ini');
var less = require('gulp-less');
// var rename = require('gulp-rename');
var shell = require('gulp-shell');
// var uglify = require('gulp-uglify');
var webpack = require('webpack-stream');
var webpackConfig = require('./webpack.config.js');
var tempStorageWorkerConfig = require('./tempstorageworker.webpack.config.js');

gulp.task('webpack-app', ['webpack-tempstorage-worker'], function() {
  return gulp.src('./src/js/index.js')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
});

gulp.task('serve', ['config-create', 'webpack-app', 'less', 'fonts', 'images'], function(){
  browserSync.init({
    open: false,
    server: {
      baseDir: './dist',
      middleware: [ historyApiFallback() ]
    }
  });

  gulp.watch('src/less/**/*.less', ['less']);
  // Re-build app and run tests on app change.
  gulp.watch('src/js/**/*.js', ['webpack-app', 'test']);
  // Run tests on test change.
  gulp.watch('src/__tests__/**/*.js', ['test']);
  gulp.watch('src/*.html').on('change', browserSync.reload);
});

gulp.task('less', function () {
  return gulp.src('./src/less/base.less')
    .pipe(less())
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
  var bootstrapFonts = 'node_modules/bootstrap/fonts/*';
  var patternflyFonts = 'node_modules/patternfly/dist/fonts/*';
  var fontAwesomeFonts = 'node_modules/patternfly/components/font-awesome/fonts/*';
  return gulp.src([bootstrapFonts, patternflyFonts, fontAwesomeFonts])
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('images', function() {
  var imagesPath = 'src/img/*';
  var patternFlyImagesPath = 'node_modules/patternfly/dist/img/*';
  return gulp.src([patternFlyImagesPath, imagesPath])
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('webpack-tempstorage-worker', function() {
  return gulp.src('./src/js/workers/TempStorageWorker.js')
    .pipe(webpack(tempStorageWorkerConfig))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('config-create', function() {
  var json;
  try {
    fs.mkdirSync(__dirname + '/dist/js');
  }
  catch(err) {}
  try {
    var config = ini.parse(fs.readFileSync('./app.conf', 'utf-8'));
    config.app = config.app || {};
    json = JSON.stringify(config.app);
  }
  catch (err) {
    json = '{}';
  }
  fs.writeFileSync(
    './dist/js/tripleo_ui_config.js',
    'window.tripleOUiConfig = ' + json + ';'
  );
});

// Do a single jasmine test run
gulp.task('test', shell.task('npm test'));

gulp.task('default', [ 'serve' ], function() {});
