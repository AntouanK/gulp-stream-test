
var gulp          = require('gulp'),
    runSequence   = require('run-sequence'),
    source        = require('vinyl-source-stream'),
    vinylBuffer   = require('vinyl-buffer'),
    tap           = require('gulp-tap'),
    concat        = require('gulp-concat'),
    size          = require('gulp-size'),
    path          = require('path');

var assets = {};  //  we'll keep our assets in memory

//  task of loading the files' contents in memory
gulp.task('load-lib-files', function(){

  //  we'll store the libs data here
  assets.libs = {};

  //  read the lib files from the disk
  return gulp.src('./src/libs/*.js')
  //  tap into the stream to get each file's data
  .pipe( concat('libs.concat.js') )
  .pipe( tap(function(file){

    //  get the file name
    var fileName =
    path.basename(file.path)
    .replace(/\./g, '_');

    //  save the file contents in the assets
    assets.libs[fileName] = file.contents.toString();

  }));
});

gulp.task('load-versions', function(){

  assets.versions = {};

  //  read the lib files from the disk
  return gulp.src('./src/versions/version.*.js')
  //  tap into the stream to get each file's data
  .pipe( tap(function(file){

    //  get the file name
    var fileName =
    path.basename(file.path)
    .replace(/\./g, '_');

    //  save the file contents in the assets
    assets.versions[fileName] = file.contents.toString();

  }) );
});

gulp.task('write-versions', function(taskDone){

  //  we store all the different version file names in an array
  var availableVersions = Object.keys(assets.versions);

  availableVersions
  .forEach(function(v){

    //  we load the data from the cocatenated libs
    var fileContents = assets.libs.libs_concat_js;
    //  we add the version's data
    fileContents += '\n' + assets.versions[v];

    //  kickstart a stream
    //var stream = source('final.' + v.replace('_js', '.js'));
  });

  taskDone();
  /*
  //gulp.src(jsFiles)
  var stream = source('merge.js');

  process.nextTick(function(){
    stream.end();
  });

  return stream
  .pipe(vinylBuffer())
  .pipe( size({showFiles: true}) );
  */

});


gulp.task('default', function(taskDone){

  runSequence(
    ['load-lib-files', 'load-versions'],
    'write-versions',
    taskDone
  );
});
