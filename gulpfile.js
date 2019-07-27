var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var through2 = require('through2');
var fs = require('fs');
var tsProject = ts.createProject('tsconfig.json');

function replaceFunctionCall(oldFunction, newFunction, code, filepath) {
  return code.replace(new RegExp(oldFunction + '\\(([^,)]+)', 'gm'), function (_, group1) {
    const lastDot = group1.lastIndexOf('.');
    if (lastDot < 0) {
      throw new Error('`' + group1 + '` needs to be a variable access, so that it can be converted into a reference in `' + oldFunction + '(' + group1 + ')` in file ' + filepath);
    }

    return newFunction + '(' + group1.substring(0, lastDot) + ",'" + group1.substring(lastDot + 1) + "'";
  });
}

/*
 This could be improved a lot by actually parsing the code
 -> Would not 
 */
function preprocess(file, cb) {
  if (file.isBuffer()) {

    //console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(file)));
    const name = file.relative;
    let code = file.contents.toString();
    //console.log(name);

    if (name !== 'Archive.ts') {

      try {
        code = replaceFunctionCall("transformInt", "_Int", code, file.path);
        code = replaceFunctionCall("transformString", "_String", code, file.path);
        code = replaceFunctionCall("transformFloat", "_Float", code, file.path);
        code = replaceFunctionCall("transformLong", "_Long", code, file.path);
        code = replaceFunctionCall("transformByte", "_Byte", code, file.path);
        code = replaceFunctionCall("transformHex", "_Hex", code, file.path);
      } catch (error) {
        // Output the error and stop this compiling, but don't stop the watcher
        cb(error);
        return;
      }

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
  try {
    build('src/**/*.ts');
  } catch (e) {
    console.error(e);
  }

  // then only build incrementally
  gulp.watch('src/**/*.ts').on('change', function (file) {
    console.log(`Rebuild ${file} ...`);
    build(file).on('error', function (error) {
      console.error(error);
      this.emit('end');
    });
    //gulp.src(file).pipe(tsProject()).pipe(gulp.dest('dist'));
  });
});

