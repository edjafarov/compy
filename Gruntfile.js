var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;

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
    src:{
      js:[ base + '/**/*.js'],
      css:[ base + '/**/*.css']
    },
    clean: {
      options:{force:true},
      dist:['<%= dest %>'],
      comp: base + '/component.json'
    },
    component_build:{
      app:{
        base: base,
        output:'<%= dest %>'
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
    },
    component_json:{
      app:{
        src: ['<%= src.js %>','<%= src.css %>'],
        dest: base
      }
    }
  })
  
  grunt.loadNpmTasks('grunt-component-build');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerMultiTask('component_json','comp gen',function(){
    var sources = {
      scripts: [],
      styles: []
    }
    this.files.forEach(function(file){
      file.src.forEach(function(filepath) {
        filepath = path.relative(base, filepath);
        if(/^(components|dist)\//.test(filepath)) return;
        /.css$/.test(filepath) && sources.styles.push(filepath);
        /.js$/.test(filepath) && sources.scripts.push(filepath);
        grunt.log.writeln(filepath + " added");
      })
    })
    var pkg = grunt.file.readJSON(base + '/package.json');
    var compy = {
      name: pkg.name,
      version: pkg.version,
      scripts: sources.scripts,
      styles: sources.styles,
      license: pkg.license,
      dependencies: pkg.component.dependencies,
      main: pkg.component.main
    }
    grunt.file.write(base + '/component.json', JSON.stringify(compy, null, 2));
  })


  grunt.registerTask('install_component', 'stuff', function(){
    var args = [];
    var pkgCheck = process.argv.slice(-1)[0].split(':');
    if(pkgCheck.length > 1){
      pkgCheck.shift();
      args = args.concat(pkgCheck);
    }
    var end = this.async();
    var compInstall = spawn(process.cwd() + '/node_modules/component/bin/component-install',
    args, {
      cwd: base,
      stdio: 'inherit'
    });
    compInstall.on('close', function(){
      end();
    });
  })

  grunt.registerTask('server', 'run server', function(arg){
    if(arg =="watch"){
      grunt.task.run('connect:server');
      return grunt.task.run('watch');
    }else{
      grunt.task.run('connect:alive');
    }
  });
  

  grunt.registerTask('install', ['component_json', 'install_component', 'clean:comp'])
  
  grunt.registerTask('compile', ['clean:dist','component_json', 'component_build','concat','preprocess','clean:comp']);

  grunt.registerTask('default',['compile'])
}

