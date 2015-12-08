var gulp = require("gulp"),
    connect = require("gulp-connect"),
    jade = require("gulp-jade"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    annotate = require("gulp-ng-annotate"),
    templateBundler = require("gulp-angular-templates"),
    del = require('del'),
    less = require('gulp-less'),
    uncss = require('gulp-uncss'),
    rename = require('gulp-rename');


gulp.task('serve', function () {
    connect.server({
        root: 'dev'
    });
});

gulp.task('build', ['minifyFormJs', 'minifyCreateJs','copyHtml', 'copyPhp', 'less', 'copyJS']);

gulp.task('clean', function (cb) {
    del([
    'dist',
    'build'
  ], cb);
});

gulp.task('jade', ['clean'], function () {
    return gulp.src('./app/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('copyHtml',['jade'], function () {
    gulp.src(['./build/sample-index.html','./build/sample-index-2.html'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('htmlToJs', ['jade'], function () {
    return gulp.src('build/form.html')
        .pipe(templateBundler({
            module: 'templates',
            standalone: true
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('concat', ['htmlToJs'], function () {
    return gulp.src(['./build/form.html.js', './app/jiraForm.js'])
        .pipe(concat('jiraForm.js'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('annotate', ['concat'], function () {
    return gulp.src(['build/jiraForm.js', 'app/jiraCreate.js'])
        .pipe(annotate())
        .pipe(gulp.dest('build'));
});

gulp.task('minifyFormJs', ['annotate'], function (){
    return gulp.src('./build/jiraForm.js')
        .pipe(uglify())
        .pipe(rename('jiraForm.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('minifyCreateJs', ['annotate'], function (){
    return gulp.src('./build/jiraCreate.js')
        .pipe(uglify())
        .pipe(rename('jiraCreate.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('copyJS', ['annotate'], function () {
    return gulp.src(['./build/jiraCreate.js', './build/jiraForm.js'])
        .pipe(gulp.dest('dist'));
})

gulp.task('copyPhp', ['clean'], function () {
    gulp.src('./app/*.php')
        .pipe(gulp.dest('./dist'));
});

gulp.task('less', ['clean'], function () {
  return gulp.src(['./app/jira-form-styles.less', './app/jira-form-styles-without-bootstrap.less'])
    .pipe(less({
      paths: [ 'app/' ]
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('uncss', ['jade'], function(cb) {
    return gulp.src('app/bootstrap.css')
        .pipe(uncss({
            html: ['build/form.html']
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('dev', ['build'], function () {
    gulp.src('./dist/*').pipe(gulp.dest('./dev'));
});
