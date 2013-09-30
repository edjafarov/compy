/**
 * Module dependencies.
 */

var component = require('component')
  , fs = require('fs')
  , exists = fs.existsSync
  , utils = component.utils
  , log = utils.log
  , error = utils.error
  , url = require('url')
  , path = require('path')
  , resolve = path.resolve
  , async = require('async');

// parse argv

module.exports = function (config, opts, callback){

  // pkgs

  var pkgs = opts.args;

  // install from ./component.json

  var local = 0 == pkgs.length;

  // component.json required

  if (local && !config) utils.fatal('missing config');

  // read json

  var conf = config;

  // install from ./component.json

  if (local) {
    if (conf.dependencies) {
      pkgs = normalize(conf.dependencies);
    }

    if (conf.development && opts.dev) {
      pkgs = pkgs.concat(normalize(conf.development));
    }

    if (conf.local) {
      conf.local.forEach(function(pkg){
        try {
          var deps = component.dependenciesOf(pkg, conf.paths);
          deps.map(normalize).forEach(function(deps){
            pkgs = pkgs.concat(deps);
          });
        } catch (err) {
          utils.fatal(err.message);
        }
      });
    }
  }

  // save to ./component.json
  var deps = null;

  if (!local) {
    deps = conf.dependencies;
    var key = opts.dev ? 'development' : 'dependencies';

    conf[key] = conf[key] || {};
    pkgs.forEach(function(pkg){
      pkg = parsePackage(pkg);
      conf[key][pkg.name] = pkg.version || '*';
      deps[pkg.name] = pkg.version || '*';
    });
    
    if (exists('component.json')) saveConfig();
  }

  // implicit remotes

  conf.remotes = conf.remotes || [];

  // explicit remotes

  if (opts.remotes) {
    conf.remotes = opts.remotes.split(',').concat(conf.remotes);
  }

  // default to github

  conf.remotes.push('https://raw.github.com');

  // install

  async.each(pkgs, function(pkg, callback){
    pkg = parsePackage(pkg);
    install(pkg.name, pkg.version || 'master', callback);
  }, installDone);

  function installDone(err){
    if(err) return console.log(err);
    log('install',"DONE");
    callback(null, deps);
  }

  // parse package identifier

  function parsePackage(pkg) {
    var parts = pkg.split('@');
    return {
      name: parts.shift(),
      version: parts.shift()
    };
  }

  // map deps to args

  function normalize(deps) {
    return Object.keys(deps).map(function(name){
      return name + '@' + deps[name];
    });
  }

  // reporter

  function report(pkg, options) {
    options = options || {};
    if (pkg.inFlight) return;
    log('install', pkg.name + '@' + pkg.version);

    pkg.on('error', function(err){
      if (err.fatal) {
        error(err.message);
        process.exit(1);
      }

      error(err.message);
    });

    if (opts.verbose) {
      pkg.on('dep', function(dep){
        log('dep', dep.name + '@' + dep.version);
        report(dep, options);
      });

      pkg.on('exists', function(dep){
        log('exists', dep.name + '@' + dep.version);
      });

      pkg.on('file', function(file){
        log('fetch', pkg.name + ':' + file);
      });
    }

    pkg.on('end', function(){
      log('complete', pkg.name);
    });
  }

  // padding

  process.on('exit', function(){
    //console.log("EXIT");
  });

  /**
   * Install package `name` at the given `version`
   * from all specified remotes.
   *
   * @param {String} name
   * @param {String} version
   * @api private
   */

  function install(name, version, callback) {
    touch(opts.out);

    // kick off installation
    var pkg = component.install(name, version, {
      dest: opts.out,
      force: opts.force,
      dev: opts.dev,
      remotes: conf.remotes
    });
    pkg.force = opts.force;
    report(pkg);
    //comment it for a while https://github.com/component/component/pull/414
    pkg.on('end', function(){
      setTimeout(callback, 200);
    });
    
    pkg.on('exists', function(){
      setTimeout(callback, 200);
    })
    
    // TODO: add callback
    pkg.install();
  }

  /**
   * Touch `path` when present.
   *
   * @param {String} path
   * @api private
   */

  function touch(path) {
    try {
      fs.utimesSync(path, new Date, new Date);
    } catch (err) {
      // ignore
    }
  }

  /**
   * Save configuration.
   *
   * @api private
   */

  function saveConfig() {
    var path = resolve('component.json');
    fs.writeFileSync(path, JSON.stringify(conf, null, 2));
  }

}
