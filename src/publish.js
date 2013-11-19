var _ = require('underscore');
var spawn = require('child_process').spawn;
var async = require('async');
var rimraf = require('rimraf');

function git(cwd){
  return function (args, callback){
    var cp = spawn('git', args, {cwd:cwd });
    var output = "";
    cp.stdout.on('data', function(data){
      process.stdout.write(data);
      output+=data;
    });

    cp.stderr.on('data', function(data){
      process.stderr.write(data);
    });

    cp.on('close', function(code){
      callback(code, output.toString());
    });
  }
};
//git rev-parse --abbrev-ref HEAD
module.exports = function(grunt){
  grunt.registerTask('publish', function(){
    var done = this.async();
    var config = grunt.config('componentConfig');
    // handle error if no git repo
    git(process.cwd())(['rev-parse','--abbrev-ref','HEAD'], function(err, branch){
      if(branch === "master\n"){
        return console.log("You can't publish from master branch. master is for published component. Your dev code should be elsewere. And by compy publish it will be published in master.");
      }
      //check if everything is committed to develop
      branchChecked();
    });
    
    function branchChecked(){
      
      ['images','fonts','scripts','styles','templates'].forEach(function(asset){
        if(config[asset]){
          config[asset] = grunt.file.expand(config[asset]);
        }
      });
      grunt.config.get('utils.ignoreSources')(config, grunt.config('src.tests'));
      Object.keys(config).forEach(function(val){
        if(_(config[val]).isEmpty()){
          delete config[val];
        }
      });
      grunt.file.mkdir("_pub");
   
      async.eachSeries([
        ['init'],
        ['remote', 'add', 'github', grunt.config('pkg.repository.url')],
        ['pull', 'github', 'master', '--tags']
      ], git(process.cwd() + "/_pub"), getTags);
    }

    function getTags(err){
      console.log("get tags");
      git(process.cwd() + "/_pub")(['log',
      '--tags',
      '--simplify-by-decoration',
      '--pretty=%ai %d'], gotTagsData);
    }
    
    function gotTagsData(err, data){
      var data = _(data.split("\n")).without("");
      data = data.map(function(line){
        var parsed = line.match(/^([^\(]*)\s{2}\((.*)\)/);
        if (!parsed) return null;
        var ver = parsed[2].match(/(\d+\.\d+\.\d+)/);
        if (!ver) return null;
        return {date: parsed[1], version: ver[1]}
      })
      
      var isAlreadyPublished = _.chain(data).without(null).findWhere({version: grunt.config.get('pkg.version')}).value();

      if(isAlreadyPublished){
        console.log("This version is already published. Please update version in package.json file");
        return cleanup();
      }
      repoPrepared();
    }

    function repoPrepared(err){
      grunt.file.expand('_pub/*').forEach(grunt.file.delete);
      ['images','fonts','scripts','styles','templates'].forEach(function(asset){
        if(config[asset]){
          config[asset].forEach(function(file){
            grunt.file.copy(file, "_pub/" + file);
          })
        }
      });
      grunt.file.write("_pub/component.json", JSON.stringify(config, null, 2));
      publishToRepo();
    // TODO:
    // move readme file
    // create standalone sources
    // create minified sources
    // publish refreshed gh-pages site
    }

    function publishToRepo(){
      async.eachSeries([
        ['add','-A'],
        ['commit','-m','Component published: ' + new Date().toString()],
        ['tag', '-a', 'v' + grunt.config.get('pkg.version'), '-m', 'version ' + grunt.config.get('pkg.version')],
        ['push', 'github', 'master', '--force', '--tags']
      ], git(process.cwd() + "/_pub"), cleanup);
    
      
      
      
      // git add all files
      // git commit changes
      // git push remote
      // git tag repo with new version
      // git push tags
        //cleanup
      // remove pub director
    }

    function cleanup(){
      grunt.file.delete('_pub');
      done();
    }
  })
}
