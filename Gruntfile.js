var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var compInstall = require('./component_install.js');

var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
};

var folderDir = function folderDir(connect, point){
    return connect.directory(path.resolve(point));
}

module.exports = function(grunt){
  
  //TODO: load base Gruntfile.js
  //TODO: inject grunt with hacked initConfig
  //TODO: write test
  var appJsProd = 'app' + Date.now() + ".js";
  var appCssProd = 'app' + Date.now() + ".css";
  var base = grunt.option('targetBase');
  var destination = base +"/dist";
  grunt.initConfig({
    pkg: grunt.file.readJSON(base + '/package.json'),
    dest: destination,
    componentConfig:{
      name: '<%= pkg.name %>',
      main: '<%= pkg.compy.main %>',
      dependencies: '<%= pkg.compy.dependencies %>',
      version: '<%= pkg.version %>',
      license: '<%= pkg.license %>',
      scripts:'<%= src.js %>',
      styles: '<%= src.css %>',
      images: '<%= src.img %>',
      fonts: '<%= src.fnt %>',
      templates: '<%= src.tmpl %>'
    },
    src:{
      js:[ '**/*.js', '**/*.coffee'],
      css:[ '**/*.css'],
      img:[ '**/*.jpg', '**/*.png', '**/*.gif', '**/*.icn'],
      fnt:[ '**/*.ttf', '**/*.eof'],
      tmpl: [ '**/*.html']
    },
    clean: {
      options:{force:true},
      dist:['<%= dest %>']
    },
    component_build:{
      app:{
        base: base,
        output:'<%= dest %>',
        config:'<%= componentConfig %>',
        configure: function(builder){
          console.log(builder.config);
          var pkg = grunt.file.readJSON(base + '/package.json');
          if(pkg.compy.dependencies){
            builder.config.dependencies = pkg.compy.dependencies;
          }
          ignoreSources(builder.config);
        },
        plugins:['coffee', 'templates']
      }
    },
    watch: {
      options:{
        livereload: true,
        nospawn: true
      },
      js: {
        files: '<%= src.js %>',
        tasks: ['compile']
      },
      css:{
        files: '<%= src.css %>',
        tasks: ['compile']
      },
      html:{
        files: '<%= src.tmpl %>',
        tasks: ['compile']
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
        src: __dirname + '/index.html',
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
        src: __dirname + '/index.html',
        dest:'<%= dest %>/index.html'
      }
    },
    concat: {
      dist: {
        src: ['<%= dest %>/app.js', 'tmpl/runner.js'],
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
    }
  })
 
  function ignoreSources(config){
    ['images','fonts','scripts','styles','templates'].forEach(function(asset){
      var remap = [];
      if(!config[asset]) return;
      config[asset].forEach(function(filepath){
        var relPath = path.relative(base, filepath);
        if(/^(components|dist)\//.test(relPath)) return;
        remap.push(relPath);
      })
      config[asset] = remap;
    })
  }
  
  grunt.loadTasks(__dirname + '/node_modules/grunt-component-build/tasks');
  grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-connect/tasks');
  grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-watch/tasks');
  grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-clean/tasks');
  grunt.loadTasks(__dirname + '/node_modules/grunt-preprocess/tasks');
  grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-concat/tasks');
  grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-uglify/tasks');
  grunt.loadTasks(__dirname + '/node_modules/grunt-contrib-cssmin/tasks');

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

  grunt.registerTask('server', 'run server', function(arg){
    if(arg =="watch"){
      grunt.task.run('connect:server');
      return grunt.task.run('watch');
    }else{
      grunt.task.run('connect:alive');
    }
  });
  
  grunt.registerTask('compile', ['clean:dist', 'component_build','concat','preprocess:html']);

  grunt.registerTask('build', ['clean:dist', 'component_build','concat','preprocess:build', 'uglify', 'cssmin']);

  grunt.registerTask('default',['compile'])
}

