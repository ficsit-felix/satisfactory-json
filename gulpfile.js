var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var through2 = require('through2');
var fs = require('fs');
var tsProject = ts.createProject('tsconfig.json');

function preprocess(file, cb) {
  if (file.isBuffer()) {

    //console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(file)));
    const name = file.relative;
    let code = file.contents.toString();
    //console.log(name);

    if (name !== 'Archive.ts') {

      code = code.replace(/_Int\(([^,)]+)/gm, function (_, group1) {
        console.log(group1);
        const lastDot = group1.lastIndexOf('.');
        if (lastDot < 0) {
          throw new Error('`' + group1 + '` needs to be a variable access, so that it can be converted into a reference in `_Int(' + group1 + ')` in file ' + file.path);
        }

        return 'transformInt(' + group1.substring(0, lastDot) + ",'" + group1.substring(lastDot + 1) + "'";
      });

    }


    file.contents = Buffer.from(code)
  } else {
    throw new Error('file is not a Buffer');
  }


  cb(null, file);
}

function build(glob) {
  return gulp.src(glob, { base: 'src/' })
    .pipe(through2.obj(function (file, _, cb) {

      // preprocessor for bidirectional transforms
      preprocess(file, cb);

    }
    ))
    .pipe(tsProject())

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

