var component = require('component')
  , path = require('path')
  , resolve = path.resolve
  , lookup = component.lookup;

module.exports = function(grunt){
  grunt.registerTask('graph', function(){
    var depTree = tree(grunt.config('componentConfig'));
    printTree(depTree);
  });

  function printTree(tree, depth){
    depth = depth || 0;
    console.log(new Array(depth*2 + 1).join(' ') + tree.label + " =", tree.ver);
    depth++;
    tree.nodes.forEach(function(node){
      printTree(node, depth);
    })
  }
}

function tree(conf, paths, depth){
  depth = depth || 0;
  conf = conf.name?conf:require(resolve(conf));
  var deps = Object.keys(conf.dependencies || {});
  var node = {};

  // local deps
  if (conf.local) deps = deps.concat(conf.local);

  // lookup paths
  paths = (paths || ['components']).concat(conf.paths);

  // label
  node.label = conf.name;
  node.ver = conf.version;

  // flag local
  node.local = !conf.repo;

  // --depth n
  if (++depth > 10) return node;

  // dependencies
  node.nodes = deps.map(function(dep){
    var dep = dep.replace('/', '-');
    var file = lookup(dep, paths);
    if (!file) throw new Error('failed to resolve location of "' + dep + '"');
    file = resolve(file, 'component.json');
    return tree(file, paths, depth);
  });

  return node;
}


