
var gulp          = require('gulp'),
    runSequence   = require('run-sequence'),
    es            = require('event-stream'),
    source        = require('vinyl-source-stream'),
    vinylBuffer   = require('vinyl-buffer'),
    tap           = require('gulp-tap'),
    concat        = require('gulp-concat'),
    size          = require('gulp-size'),
    path          = require('path'),
    Q             = require('q');

var memory = {};  //  we'll keep our assets in memory

//  task of loading the files' contents in memory
gulp.task('load-lib-files', function(){

  //  read the lib files from the disk
  return gulp.src('./src/libs/*.js')
  //  concatenate all lib files into one
  .pipe( concat('libs.concat.js') )
  //  tap into the stream to get each file's data
  .pipe( tap(function(file){
    //  save the file contents in memory
    memory[path.basename(file.path)] = file.contents.toString();
  }));
});

gulp.task('load-versions', function(){

  memory.versions = {};

  //  read the lib files from the disk
  return gulp.src('./src/versions/version.*.js')
  //  tap into the stream to get each file's data
  .pipe( tap(function(file){
    //  save the file contents in the assets
    memory.versions[path.basename(file.path)] = file.contents.toString();
  }) );
});

gulp.task('write-versions-stream', function(){

  //  we store all the different version file names in an array
  var availableVersions = Object.keys(memory.versions),
      //  we make an array to store all the stream promises
      streams = [];

  availableVersions
  .forEach(function(v){

        //  make a new stream with fake file name
    var stream = source('final.' + v ),
        //  we load the data from the concatenated libs
        fileContents = memory['libs.concat.js'] +
          //  we add the version's data
          '\n' + memory.versions[v];

    streams.push(stream);

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
      //console.log('file written');
    });
  });

  return es.merge.apply(this, streams);

});


gulp.task('write-versions', function(){

  //  we store all the different version file names in an array
  var availableVersions = Object.keys(memory.versions),
      //  we make an array to store all the stream promises
      streamPromises = [];

  availableVersions
  .forEach(function(v){

    //  make a promise for that version-stream
    var deferred = Q.defer();
    //  add it to the promises array
    streamPromises.push(deferred);

        //  make a new stream with fake file name
    var stream = source('final.' + v ),
        //  we load the data from the concatenated libs
        fileContents = memory['libs.concat.js'] +
          //  we add the version's data
          '\n' + memory.versions[v];

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
      //console.log('file written');
      deferred.resolve();
    });
  });

  return streamPromises;

});

//============================================ our main task
gulp.task('stream', function(taskDone){

  runSequence(
    ['load-lib-files', 'load-versions'],  //  load the files in parallel
    'write-versions-stream',  //  ready to write once all resources are in memory
    taskDone           //  done
  );
});

gulp.task('promises', function(taskDone){

  runSequence(
    ['load-lib-files', 'load-versions'],  //  load the files in parallel
    'write-versions',  //  ready to write once all resources are in memory
    taskDone           //  done
  );
});

//============================================ our watcher task
//  only watch after having run 'default' once so that all resources
//  are already in memory
gulp.task('watch', ['default'], function(){

  gulp.watch('./src/libs/*.js', function(){
    runSequence(
      'load-lib-files',  //  we only have to load the changed files
      'write-versions-stream'
    );
  });

  gulp.watch('./src/versions/*.js', function(){
    runSequence(
      'load-versions',  //  we only have to load the changed files
      'write-versions-stream'
    );
  });

});
