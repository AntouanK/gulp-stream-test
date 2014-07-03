
var gulp          = require('gulp'),
    runSequence   = require('run-sequence'),
    source        = require('vinyl-source-stream'),
    vinylBuffer   = require('vinyl-buffer'),
    tap           = require('gulp-tap'),
    concat        = require('gulp-concat'),
    size          = require('gulp-size'),
    path          = require('path'),
    Q             = require('q');

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

gulp.task('write-versions', function(){

  //  we store all the different version file names in an array
  var availableVersions = Object.keys(assets.versions),
      //  we make an array to store all the stream promises
      streamPromises = [];

  availableVersions
  .forEach(function(v){

    //  make a promise for that version-stream
    var deferred = Q.defer();
    //  add it to the promises array
    streamPromises.push(deferred);

        //  make a new stream with fake file name
    var stream = source('final.' + v.replace('_js', '.js')),
        //  we load the data from the cocatenated libs
        fileContents = assets.libs.libs_concat_js +
        //  we add the version's data
        '\n' + assets.versions[v];

    //  write the file contents to the stream
    stream.write(fileContents);

    process.nextTick(function(){
      //  in the next process cycle, end the stream
      stream.end();
    });

    stream
    //  transform the raw data into the stream, into a vinyl object/file
    .pipe( vinylBuffer() )
  //.pipe( tap(function(file){ /* do something with the file contents here */ }) )
    .pipe( gulp.dest('./output') )
    .on('end', function(){
      //  TODO : solve ending in this task
      deferred.resolve();
    });
  });

  return streamPromises;

});


gulp.task('default', function(taskDone){

  runSequence(
    ['load-lib-files', 'load-versions'],
    'write-versions',
    taskDone
  );
});

//  only watch after having run 'deafault' once so that all resources
//  are already in memory
gulp.task('watch', ['default'], function(){

  gulp.watch('./src/libs/*.js', function(){
    runSequence(
      'load-lib-files',  //  we only have to load the changed files
      'write-versions'
    );
  });

  gulp.watch('./src/versions/*.js', function(){
    runSequence(
      'load-versions',  //  we only have to load the changed files
      'write-versions'
    );
  });

});
