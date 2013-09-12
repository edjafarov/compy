var connect = require('connect');
var async = require('async');
var config = require(__dirname + '/config.json');
var _ = require('underscore');

var folderMount = function folderMount(point) {
  return connect.static(path.resolve(point));
};

var folderDir = function folderDir(point){
  return connect.directory(path.resolve(point));
}


module.exports = {
  middleware: function(buildDir, options){
    options = {
      livereload : true,
      serveStatic : true,
      serveDir : true,
      middleware: []
    }
    var livereload = require('connect-livereload')({
      port : config.livereloadPort
    }
    var serveStatic = folderMount(buildDir);
    var serveDir = folderDir(buildDir);

    return function(req, res, next){
      var middlewares = [];
      if(options.livereload) middlewares.push(async.apply(livereload, req, res));
      if(options.serveStatic) middlewares.push(async.apply(serveStatic, req, res));
      if(options.serveDir) middlewares.push(async.apply(serveDir, req, res));
      if(options.middleware) middlewares = middlewares.concat(options.middleware);
      async.series(middlewares,next);
    }
  }
}