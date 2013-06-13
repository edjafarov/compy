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

  var base = grunt.option('targetBase');
  var destination = base +"/dist";
  grunt.initConfig({
    pkg: grunt.file.readJSON(base + '/package.json'),
    dest: destination,
    componentConfig:{
      name: '<%= pkg.name %>',
      main: '<%= pkg.component.main %>',
      dependencies: '<%= pkg.component.dependencies %>',
      version: '<%= pkg.version %>',
      license: '<%= pkg.license %>',
      scripts:'<%= src.js %>',
      styles: '<%= src.css %>',
      images: '<%= src.img %>',
      fonts: '<%= src.fnt %>'
    },
    src:{
      js:[ base + '/**/*.js'],
      css:[ base + '/**/*.css'],
      img:[ base + '/**/*.jpg', base + '/**/*.png', base + '/**/*.gif', base + '/**/*.icn'],
      fnt:[base + '/**/*.ttf',base + '/**/*.eof']
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
          ignoreSources(builder.config);
        }
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
      options:{
        context:{
          name: '<%= pkg.name %>',
          main: '<%= pkg.component.main %>',
          description: '<%= pkg.description %>',
          title: '<%= pkg.title %>'
        }
      },
      html:{
        src:'./index.html',
        dest:'<%= dest %>/index.html'
      }
    },
    concat: {
      dist: {
        src: ['<%= dest %>/app.js', 'tmpl/runner.js'],
        dest: '<%= dest%>/app.js'
      }
    }
  })
 
  function ignoreSources(config){
    ['images','fonts','scripts','styles'].forEach(function(asset){
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
  
  grunt.loadNpmTasks('grunt-component-build');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-concat');


  grunt.registerTask('install', 'Install component', function(){
    var config = grunt.config('componentConfig');
    ['images','fonts','scripts','styles'].forEach(function(asset){
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
    compInstall(config, {args: args, out: base + "/components"}, installed);

    function installed(err, deps){
      var pkg = grunt.file.readJSON(base + '/package.json');
      pkg.component.dependencies = deps;
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
  
  grunt.registerTask('compile', ['clean:dist', 'component_build','concat','preprocess']);

  grunt.registerTask('default',['compile'])
}

