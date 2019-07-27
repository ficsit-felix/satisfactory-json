var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var through2 = require('through2');

var tsProject = ts.createProject('tsconfig.json');

function preprocess(data) {
  console.log(data);
}

function build(glob) {
  return gulp.src(glob, { base: 'src/' })
    .pipe(tsProject())
    /*    .pipe(through2.obj(function (file, _, cb) {
          console.log(file);
          if (file.isBuffer()) {
            let code = file.contents.toString();
    
            code = code.replace(/transform/g, "BANANA");
            file.contents = Buffer.from(code)
          }
          cb(null, file);
        }))*/
    .pipe(gulp.dest('lib'));
}

gulp.task('default', function (cb) {
  return build('src/**/*.ts');
});

/*gulp.task('scripts', function () {
  return gulp.src('lib/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('dist'));
});
*/
gulp.task('watch', function () {
  // initially build all files
  build('src/**/*.ts');

  // then only build incrementally
  gulp.watch('src/**/*.ts').on('change', function (file) {
    console.log('change', file);
    return build(file);
    //gulp.src(file).pipe(tsProject()).pipe(gulp.dest('dist'));
  });
});

