var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var compInstall = require('./component_install.js');
var fs = require('fs');
var _ = require('underscore');

var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
};

var folderDir = function folderDir(connect, point){
    return connect.directory(path.resolve(point));
}

var config = require(__dirname + "/config.json");
module.exports = function(grunt){
  // generate file names for prod
  var appJsProd = 'app' + Date.now() + ".js";
  var appCssProd = 'app' + Date.now() + ".css";
  var indexTemplate = __dirname + '/index.html';
  
  var base = grunt.option('targetBase');
  var cmd = grunt.option('cmd').toString();
  process.env.targetBase = base;
  
  var destination = grunt.option('destination');
  process.env.destBase = destination;
  var serverPath = grunt.option('server');
  
  //override index html
  if(grunt.file.exists(base + "/index.html")){
    indexTemplate = base + "/index.html";
  }

  // build ignore source pattern
  var ignore = ['components','dist','node_modules'];
  var packageJson = grunt.file.readJSON(base + '/package.json');
  if(packageJson.compy && packageJson.compy.paths) {
    ignore = ignore.concat(packageJson.compy.paths);
  }
  var ignoreString = '(' + ignore.join('|') + ')';
  //prepare projects karma plugins
  // mocha, jasmine, sinon - whatewer
  // set'em up if they are declated in config
  var customTestSetup = (packageJson.compy && packageJson.compy.tests)?packageJson.compy.tests:{};
  if(customTestSetup.plugins && customTestSetup.plugins.length > 0){
    // we can error handle here and check if those plugins are installed in project's folder
    // also we can check if they are installed in compy's node_modules folder
    customTestSetup.plugins = _(customTestSetup.plugins).map(function(plugin){
      return base + "/node_modules/" + plugin;
    });
  }


  var compyGruntConfig = {
    pkg: packageJson,
    dest: destination,
    targetBase: base,
    // this is like component.json contents for component
    componentConfig:{
      name: '<%= pkg.name %>',
      main: '<%= pkg.compy.main %>',
      author: '<%= pkg.author %>',
      description: '<%= pkg.description %>',
      dependencies: '<%= pkg.compy.dependencies %>',
      development: '<%= pkg.compy.development %>',
      version: '<%= pkg.version %>',
      license: '<%= pkg.license %>',
      scripts:'<%= src.scripts %>',
      styles: '<%= src.styles %>',
      images: '<%= src.images %>',
      fonts: '<%= src.fonts %>',
      files: '<%= pkg.compy.files %>',
      templates: '<%= src.templates %>',
      paths: '<%= pkg.compy.paths %>',
      local: '<%= pkg.compy.local %>',
      remotes: '<%= pkg.compy.remotes %>',
      keywords: '<%= pkg.keywords %>',
      repo: (function(){
        if(packageJson.repository && packageJson.repository.type === "git"){
          var repo = /([^\/]*?\/[^\/]*?)\.git/.exec(packageJson.repository.url);
          return repo && repo[1];
        }
        return null;
      })()
    },
    // we-re taking all sources from here
    src:{
      scripts:[ base + '{/!'+ignoreString+'/**/*.js,/*.js}'],
      styles:[ base + '{/!'+ignoreString+'/**/*.css,/*.css}'],
      images:[ base+ '/!'+ignoreString+'/**/*.{jpg,png,gif,icn}', base+ '/*.{jpg,png,gif,icn}'],
      fonts:[ base+ '/!'+ignoreString+'/**/*.{ttf,eof}', base + '/*.{ttf,eof}'],
      templates: [ base+ '{/!'+ignoreString+'/**/*.html,/*.html}', '!' + base + '/index.html'],
      tests:[ base + '{/!'+ignoreString+'/**/*.spec.js,/*.spec.js}']
    },
    // we clean up generated source
    clean: {
      options:{force:true},
      dist:['<%= dest %>']
    },
    // we use customized component build grunt task
    component_constructor:{
      options:{
        output:'<%= dest %>',
        config:'<%= componentConfig %>',
        base: base,
        sourceUrls: false
      },
      app:{
        options:{
          target: 'app',
          standalone: grunt.option('isStandaloneLib'),
          configure: function(builder){
            // we overwrite dependencies to be able to hot component reload while watch
            var pkg = grunt.file.readJSON(base + '/package.json');
            if(pkg.compy.dependencies){
              builder.config.dependencies = pkg.compy.dependencies;
            }
            usePlugins(base, builder);
            ignoreSources(builder.config, grunt.config('src.tests'));
            
          }
        }
      },
      test: {
        options:{
          dev: true,
          configure: function(builder){
            // we overwrite dependencies to be able to hot component reload while watch
            var pkg = grunt.file.readJSON(base + '/package.json');
            if(pkg.compy.dependencies){
              builder.config.dependencies = pkg.compy.dependencies;
            }
            usePlugins(base, builder);
            ignoreSources(builder.config);
            
          }
        }
      },
      styles_dev: {
        options:{
          name: 'app',
          assetType: 'styles',
          configure: function(builder){
            // we overwrite dependencies to be able to hot component reload while watch
            var pkg = grunt.file.readJSON(base + '/package.json');
            if(pkg.compy.dependencies){
              builder.config.dependencies = pkg.compy.dependencies;
            }
            usePlugins(base, builder);
            ignoreSources(builder.config);
            
          }
        }
      },
      scripts_dev: {
        options:{
          name: 'app',
          assetType: 'scripts',
          configure: function(builder){
            // we overwrite dependencies to be able to hot component reload while watch
            var pkg = grunt.file.readJSON(base + '/package.json');
            if(pkg.compy.dependencies){
              builder.config.dependencies = pkg.compy.dependencies;
            }
            usePlugins(base, builder);
            ignoreSources(builder.config);
          }
        }
      },
      templates_dev: {
        options:{
          name: 'app',
          assetType: 'templates',
          configure: function(builder){
            // we overwrite dependencies to be able to hot component reload while watch
            var pkg = grunt.file.readJSON(base + '/package.json');
            if(pkg.compy.dependencies){
              builder.config.dependencies = pkg.compy.dependencies;
            }
            usePlugins(base, builder);
            ignoreSources(builder.config);
            
          }
        }
      }
    },
    watch: {
      options:{
        livereload: config.livereloadPort,
        nospawn: true
      },
      // we watch sources independantly, but that doesn't makes much sense
      js: {
        files: '<%= src.scripts %>',
        tasks: ['component_constructor:scripts_dev','concat:dist']
      },
      css:{
        files: '<%= src.styles %>',
        tasks: ['component_constructor:app', 'concat:dist']
      },
      html:{
        files: '<%= src.templates %>',
        tasks: ['component_constructor:templates_dev','concat:dist']
      }
    },
    connect: {
      options: {
        port: 8080,
        base: '<%= dest %>',
        hostname: null,
      },
      server:{
        options: {
          keepalive: false,
          middleware: function(connect, options){
            return [
            require('connect-livereload')({port:config.livereloadPort}),
            folderMount(connect, destination),
            folderDir(connect, destination)]
          }
        }
      },
      alive:{
        options: {
          keepalive: true,
        }
      }
    },
    // preprocess used to build proper index.html
    preprocess:{
      html:{
        options:{
          context:{
            name: '<%= pkg.name %>',
            main: '<%= pkg.compy.main %>',
            description: '<%= pkg.description %>',
            title: '<%= pkg.title %>',
            appdest: 'app.js',
            appcss: 'app.css'
          }
        },
        src: indexTemplate,
        dest:'<%= dest %>/index.html'
      },
      build:{
        options:{
          context:{
            name: '<%= pkg.name %>',
            main: '<%= pkg.compy.main %>',
            description: '<%= pkg.description %>',
            title: '<%= pkg.title %>',
            appdest: appJsProd,
            appcss: appCssProd
          }
        },
        src: indexTemplate,
        dest:'<%= dest %>/index.html'
      }
    },
    // concat is used to add component runner to the app
    concat: {
      options:{
        banner: '<%= pkg.compy.banner %>'
      },
      dist: {
        src: ['<%= dest %>/app.js', __dirname + '/tmpl/runner.js'],
        dest: '<%= dest%>/app.js'
      }
    },
    uglify: {
      options:{
        report: 'gzip'
      },
      build: {
        src: ['<%= dest%>/app.js'],
        dest: '<%= dest%>/' + appJsProd
      }
    },
    cssmin: {
      build: {
        src: ['<%= dest%>/app.css'],
        dest: '<%= dest%>/' + appCssProd
      }
    },
    karma: {
      unit: _({
        autoWatch:false,
        browsers:["PhantomJS"],
        colors: true,
        configFile: __dirname + '/tmpl/karma.config.js',
        reporters:['dots'],
        singleRun: true,
        plugins: [
          'karma-phantomjs-launcher',
          'karma-chrome-launcher',
          'karma-firefox-launcher'
        ]
      }).extend(customTestSetup)
    }
  }
  var matchPlugins = require('./component-plugins-matching.js');
  matchPlugins(compyGruntConfig, getPlugins(base));
  
  var plugins = getPlugins(base);
  plugins.forEach(function(plugin){
    var pluginModule = require(base + "/node_modules/" + plugin);
    if(pluginModule.ext && typeof(pluginModule.ext) == 'object'){
      Object.keys(pluginModule.ext).forEach(function(type){
        if(!compyGruntConfig.src[type]) compyGruntConfig.src[type] = [];
        pluginModule.ext[type].forEach(function(ext){
          compyGruntConfig.src[type].unshift(base + '{/!' + ignoreString + '/**/*' + ext + ',/*' + ext + '}');
        })
      });
    }
  });

  function usePlugins(baseDir, builder){
    var plugins = getPlugins(baseDir);
    plugins.forEach(function(plugin){
      var pluginModule = require(baseDir + "/node_modules/" + plugin);
      if(matchPlugins.config[plugin] && matchPlugins.config[plugin].run){
        return matchPlugins.config[plugin].run(pluginModule, builder);
      } 
      builder.use(pluginModule);
    })
  }
  /*
  * getPlugins is getting plugins from users project node_modules folder
  */
  function getPlugins(baseDir){
    var componentPlugins = [];
    if(!fs.existsSync(baseDir + "/node_modules")) return componentPlugins;
    var nodeModules = fs.readdirSync(baseDir + "/node_modules");
    nodeModules.forEach(function(module){
      if(!/^component-/.test(module)) return;
      componentPlugins.push(module);
    });
    return componentPlugins;
  }


  // this dark magic allows to extend Gruntfiles
  if(grunt.file.exists(base + '/Gruntfile.js')){
    var innerGruntfile = require(base + '/Gruntfile.js');
    var oldInit = grunt.initConfig;
    var pseudoGrunt = grunt;
    pseudoGrunt.initConfig = initConfig;
    function initConfig(configObject){
      for(var key in configObject){
        compyGruntConfig[key] = configObject[key];
      }
      oldInit.call(this, compyGruntConfig);
    }
    innerGruntfile(pseudoGrunt);

    var oldReg = grunt.registerTask
    grunt.registerTask = function(){
      if(grunt.task._tasks[arguments[0]]) return;
      oldReg.apply(this, arguments);
    }
  }else{
    grunt.initConfig(compyGruntConfig);
  }
  function ignoreSources(config, ignorePatterns){
    ['images','fonts','scripts','styles','templates'].forEach(function(asset){
      var testFor = new RegExp('^(' + ignore.join('|') + ')\\/');
      var ignoreFiles = [];
      if(ignorePatterns){
        ignoreFiles = ignoreFiles.concat(grunt.file.expand(ignorePatterns));
      }
      var remap = [];
      if(!config[asset]) return;
      config[asset].forEach(function(filepath){
        if(!!~ignoreFiles.indexOf(filepath)) return;
        var relPath = path.relative(base, filepath);
        if(testFor.test(relPath)) return;
        remap.push(relPath.replace(/\\/g,"/"));// windows hackin
      })
      config[asset] = remap;
    })
  }
  grunt.config.set('utils.ignoreSources', ignoreSources);

  if(!!~['build','compile','server','test','watch'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-component-constructor/tasks');
  if(!!~['server'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-connect/tasks');
  if(!!~['server','watch'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-watch/tasks');
  if(!!~['build','compile','test'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-clean/tasks');
  if(!!~['build','compile'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-preprocess/tasks');
  if(!!~['build','compile','server'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-concat/tasks');
  if(!!~['build'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-uglify/tasks');
  if(!!~['build'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-cssmin/tasks');
  if(!!~['test'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-karma/tasks');


  grunt.registerTask('install', 'Install component', function(){
    var config = grunt.config('componentConfig');
    ['images','fonts','scripts','styles','templates'].forEach(function(asset){
      if(config[asset]){
        config[asset] = grunt.file.expand(config[asset]);
      }
    });
    var done = this.async();

    ignoreSources(config);
    var args = [];
    var pkgCheck = process.argv.slice(-1)[0].split(':');
    if(pkgCheck.length > 1){
      pkgCheck.shift();
      args = args.concat(pkgCheck);
    }
    if(!config.dependencies) config.dependencies = {};
    var dev = grunt.option('devInstall');

    compInstall(config, {args: args, out: base + "/components", force: grunt.option('force'), dev: dev}, installed);

    function installed(err, deps){
      if(args.length === 0) return done();
      var pkg = grunt.file.readJSON(base + '/package.json');
      pkg.compy.dependencies = deps;
      grunt.file.write(base + '/package.json', JSON.stringify(pkg, null, 2));
      done();
    }
  })


  require('./src/publish.js')(grunt);
  require('./src/graph.js')(grunt);

  grunt.registerTask('generate-tests-runner', function(){
    var specFiles = grunt.config('src.tests');
    specFiles = grunt.file.expand(specFiles);
    var source = "";
    specFiles.forEach(function(file){
      var runModule = [packageJson.name, path.relative(base, file)].join('/');
      source += "require('"+runModule+"');\n";
    });
    grunt.file.write(path.normalize(grunt.config('dest') + "/runner.js"), source);
  })

  grunt.registerTask('server', 'run server', function(arg){
    if(arg =="watch"){
      serverPath ? require(serverPath) : grunt.task.run('connect:server');
      return grunt.task.run('watch');
    }else{
      serverPath ? require(serverPath) : grunt.task.run('connect:alive');
    }
  });

  grunt.registerTask('compy-compile', ['clean:dist', 'component_constructor:app','concat:dist','preprocess:html']);

  grunt.registerTask('compy-build', ['clean:dist', 'component_constructor:app','concat:dist','preprocess:build', 'uglify', 'cssmin']);

  grunt.registerTask('compy-test', ['clean:dist', 'component_constructor:test','generate-tests-runner' ,'karma'])

  grunt.registerTask('compile', ['compy-compile']);

  grunt.registerTask('build', ['compy-build']);

  grunt.registerTask('test', ['compy-test']);

  grunt.registerTask('default', ['compile']);
}

