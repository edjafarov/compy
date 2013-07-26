var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var compInstall = require('./component_install.js');
var fs = require('fs');

var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
};

var folderDir = function folderDir(connect, point){
    return connect.directory(path.resolve(point));
}

module.exports = function(grunt){
  var karmaAdapters = __dirname + "/node_modules/grunt-karma/node_modules/karma/adapter";
  var appJsProd = 'app' + Date.now() + ".js";
  var appCssProd = 'app' + Date.now() + ".css";
  var indexTemplate = __dirname + '/index.html';
  var base = grunt.option('targetBase');
  var cmd = grunt.option('cmd').toString();
  process.env.targetBase = base;
  var destination = "./dist";
  if(grunt.file.exists(base + "/index.html")){
    indexTemplate = base + "/index.html";
  }

  var compyGruntConfig = {
    pkg: grunt.file.readJSON(base + '/package.json'),
    dest: destination,
    targetBase: base,
    // this is like component.json contents for component
    componentConfig:{
      name: '<%= pkg.name %>',
      main: '<%= pkg.compy.main %>',
      dependencies: '<%= pkg.compy.dependencies %>',
      version: '<%= pkg.version %>',
      license: '<%= pkg.license %>',
      scripts:'<%= src.scripts %>',
      styles: '<%= src.styles %>',
      images: '<%= src.images %>',
      fonts: '<%= src.fonts %>',
      templates: '<%= src.templates %>'
    },
    // we-re taking all sources from here
    src:{
      scripts:[ base + '{/!(node_modules|dist|components)/**/*.js,/*.js}'],
      styles:[ base + '{/!(node_modules|dist|components)/**/*.css,/*.css}'],
      images:[ base+ '/!(node_modules|dist|components)/**/*.{jpg,png,gif,icn}', base+ '/*.{jpg,png,gif,icn}'],
      fonts:[ base+ '/!(node_modules|dist|components)/**/*.{ttf,eof}', base + '/*.{ttf,eof}'],
      templates: [ base+ '{/!(node_modules|dist|components)/**/*.html,/*.html}', '!' + base + '/index.html'],
      tests:[ base + '{/!(node_modules|dist|components)/**/*.spec.js,/*.spec.js}']
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
        base: base
      },
      app:{
        options:{
          target: 'app',
          configure: function(builder){
            // we overwrite dependencies to be able to hot component reload while watch
            var pkg = grunt.file.readJSON(base + '/package.json');
            if(pkg.compy.dependencies){
              builder.config.dependencies = pkg.compy.dependencies;
            }
            ignoreSources(builder.config, grunt.config('src.tests'));
            usePlugins(base, builder);
          }
        }
      },
      test: {
        options:{
          configure: function(builder){
            // we overwrite dependencies to be able to hot component reload while watch
            var pkg = grunt.file.readJSON(base + '/package.json');
            if(pkg.compy.dependencies){
              builder.config.dependencies = pkg.compy.dependencies;
            }
            ignoreSources(builder.config);
            usePlugins(base, builder);
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
            ignoreSources(builder.config);
            usePlugins(base, builder);
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
            ignoreSources(builder.config);
            usePlugins(base, builder);
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
            ignoreSources(builder.config);
            usePlugins(base, builder);
          }
        }
      }
    },
    watch: {
      options:{
        livereload: true,
        nospawn: true
      },
      // we watch sources independantly, but that doesn't makes much sense
      js: {
        files: '<%= src.scripts %>',
        tasks: ['component_constructor:scripts_dev','concat:dist']
      },
      css:{
        files: '<%= src.styles %>',
        tasks: ['component_constructor:styles_dev']
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
            require('connect-livereload')({port:35729}),
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
            main: '<%= pkg.component.main %>',
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
      dist: {
        src: ['<%= dest %>/app.js', __dirname + '/tmpl/runner.js'],
        dest: '<%= dest%>/app.js'
      }
    },
    uglify: {
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
      unit: {
        autoWatch:false,
        browsers:["PhantomJS"],
        colors: true,
        configFile: __dirname + '/tmpl/karma.config.js',
        reporters:['dots'],
        singleRun: true
      }
    }
  }
  var matchPlugins = require('./component-plugins-matching.js');
  matchPlugins(compyGruntConfig, getPlugins(base));

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
      var ignore = ['components','dist','node_modules'];
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
        remap.push(relPath);
      })
      config[asset] = remap;
    })
  }
  
  if(!!~['build','compile','server','test','watch'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-component-constructor/tasks');
  if(!!~['server'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-connect/tasks');
  if(!!~['server','watch'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-watch/tasks');
  if(!!~['build','compile'].indexOf(cmd)) grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-clean/tasks');
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
    compInstall(config, {args: args, out: base + "/components"}, installed);

    function installed(err, deps){
      var pkg = grunt.file.readJSON(base + '/package.json');
      pkg.compy.dependencies = deps;
      grunt.file.write(base + '/package.json', JSON.stringify(pkg, null, 2));
      done();
    }
  })

  grunt.registerTask('generate-tests-runner', function(){
    var specFiles = grunt.config('src.tests');
    specFiles = grunt.file.expand(specFiles);
    var source = "";
    specFiles.forEach(function(file){
      var runModule = [path.basename(base), path.relative(base, file)].join('/');
      source += "require('"+runModule+"');\n";
    });
    grunt.file.write(path.normalize(base + '/' + grunt.config('dest') + "/runner.js"), source);
  })

  grunt.registerTask('server', 'run server', function(arg){
    if(arg =="watch"){
      grunt.task.run('connect:server');
      return grunt.task.run('watch');
    }else{
      grunt.task.run('connect:alive');
    }
  });
  
  grunt.registerTask('compy-compile', ['clean:dist', 'component_constructor:app','concat:dist','preprocess:html']);

  grunt.registerTask('compy-build', ['clean:dist', 'component_constructor:app','concat:dist','preprocess:build', 'uglify', 'cssmin']);

  grunt.registerTask('compy-test', ['clean:dist', 'component_constructor:test','generate-tests-runner' ,'karma'])

  grunt.registerTask('compile', ['compy-compile']);

  grunt.registerTask('build', ['compy-build']);

  grunt.registerTask('test', ['compy-test']);

  grunt.registerTask('default',['compile'])
}

