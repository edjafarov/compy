var component = require('component');
var utils = component.utils;
var cols = process.stdout.columns || 80;

module.exports = function(options){

  var query = options.terms.join(' ');

  // search

  component.search(query, function(err, pkgs){
    if (err) utils.fatal(err.message);
    if (!pkgs.length) return;
    if (options.json) json(pkgs)
    else verbose(pkgs);
  });

  /**
   * Truncate the string if necessary.
   */

  function truncate(str, repo) {
    var pad = 30 + repo.length;
    if (str.length < cols - pad) return str;
    return str.slice(0, cols - pad) + '…';
  }

  /**
   * Wrap description `str`.
   */

  function description(str) {
    if (!str) return '';
    var space;
    var width = cols - 20;
    for (var i = 0; i < str.length; ++i) {
      if (i && i % width == 0) {
        space = str.indexOf(' ', i);
        str = str.slice(0, space) + '\n ' + str.slice(space);
      }
    }
    return str;
  }

  /**
   * Filter blanks. TODO: remove... shouldn't be necessary
   */

  function blanks(pkg) {
    return pkg;
  }

  /**
   * Sort by stars descending.
   */

  function stars(a, b) {
    return b.stars - a.stars;
  }

  /**
   * Open `pkgs` in the default browser.
   */

  function open(pkgs) {
    var max = 5;
    pkgs.slice(0, max).forEach(function(pkg){
      if (!pkg.repo) return console.warn('%s missing "repo"', pkg.name);
      openSite('https://github.com/' + pkg.repo);
    });
  }

  /**
   * Verbose output.
   */

  function verbose(pkgs) {
    console.log();
    pkgs.filter(blanks).sort(stars).forEach(function(pkg){
      console.log('  \033[36m%s\033[m', pkg.repo.toLowerCase() + "@" + pkg.version);
      console.log('  url: \033[90mhttps://github.com/%s\033[m', pkg.repo);
      console.log('  desc: \033[90m%s\033[m', description(pkg.description));
      if (options.verbose) console.log('  demo: \033[90m%s\033[m', pkg.demo || 'none');
      if (options.verbose) console.log('  license: \033[90m%s\033[m', pkg.license || 'none');
      console.log('  ★ \033[90m%s\033[m', pkg.stars);
      console.log();
    });
    console.log();
  }

  /**
   * JSON output.
   */

  function json(pkgs) {
    var len = pkgs.length;
    console.log('[');
    pkgs.filter(blanks).sort(stars).forEach(function(pkg, i){
      process.stdout.write(JSON.stringify(pkg, null, 2));
      if (i < len - 1) process.stdout.write(',\n');
    });
    console.log(']');
  }

  /**
   * Handle EPIPE for pagers.
   */

  process.stdout.on('error', function(err){
    if ('EPIPE' == err.code) return;
    throw err;
  });

}
