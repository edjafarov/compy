var coffeescript = require('coffee-script');
var path = require('path');
var fs = require('fs');

module.exports = function(builder) {
  builder.hook('before scripts', function(pkg, next) {

    // No scripts field in the component.json file
    if (pkg.config.scripts === undefined) return next();

    // Get all the coffee files from the scripts list
    var coffee = pkg.config.scripts.filter(function(file){
      return path.extname(file) === '.coffee';
    });

    // No scripts
    if( coffee.length === 0 ) return next();

    coffee.forEach(function(file, i){
      var realpath = pkg.path(file);
      var str = fs.readFileSync(realpath, 'utf8');
      var compiled = coffeescript.compile(str, { filename : realpath, bare: true });
      var filename = file.replace('.coffee', '.js');
      pkg.addFile('scripts', filename, compiled);
      pkg.removeFile('scripts', file);
    });

    next();
  });
};
