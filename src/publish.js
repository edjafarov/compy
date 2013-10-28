var _ = require('underscore');
var spawn = require('child_process').spawn;
var async = require('async');

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
    // handle error if no git repo
    git(process.cwd())(['rev-parse','--abbrev-ref','HEAD'], function(err, branch){
      if(branch === "master\n"){
        return console.log("You can't publish from master branch. master is for published component. Your dev code should be elsewere. And by compy publish it will be published in master.");
      }
      //check version
    });
    
    function branchChecked(){
      var config = grunt.config('componentConfig');
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
        ['pull', 'github', 'master']
      ], git(process.cwd() + "/_pub"), repoPrepared);
    }

    function repoPrepared(err){
      ['images','fonts','scripts','styles','templates'].forEach(function(asset){
        if(config[asset]){
          config[asset].forEach(function(file){
            grunt.file.copy(file, "_pub/" + file);
          })
        }
      });
      grunt.file.write("_pub/component.json", JSON.stringify(config, null, 2));
      
      
      
      // move readme file
      // git check version updated (if not - cleanup and say this version was already published)
      // git add all files
      // git commit changes
      // git push remote
      // git tag repo with new version
      // git push tags
        //cleanup
      // remove pub director
      done();
    }
  })
}
