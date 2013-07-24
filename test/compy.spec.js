var fs = require('fs.extra');
var spawn = require('child_process').spawn;
var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');
process.env.fake = true;
var fake = process.env.fake;

describe("compy should", function(){
  after(cleanDir);

  describe('install', function(){
    this.timeout(100000);
    /*var github = nock('https://raw.github.com')
    .get('/component/model/master/component.json')
    .reply(200,{});*/
    before(function(done){
      cleanDir(function(){
        prepareDir(function(){
          runCompyWith('install', done);
        });
      })
    })
    it('should create compoents folder', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/components')).to.be.ok;
      done();
    })
    it('install component-model dependency from pachage.json', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/components/component-model')).to.be.ok;
      done();
    })
    it('with component.json inside', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/components/component-model/component.json')).to.be.ok;
      done();
    })
  })

  describe('install <component name> - component/domify', function(){
    this.timeout(100000);
    before(function(done){
      cleanDir(function(){
        prepareDir(function(){
          runCompyWith(['install:component/domify'], done);
        });
      })
    })
    it('should create compoents folder', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/components')).to.be.ok;
      done();
    })
    it('fetch component/domify', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/components/component-domify')).to.be.ok;
      done();
    })
    it('with component.json inside', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/components/component-domify/component.json')).to.be.ok;
      done();
    })
    it('save it as dependency in local package.json', function(done){
      expect(require(__dirname + '/tempdata/package.json').compy.dependencies).to.have.property("component/domify","*");
      done();
    })

  })

  describe('compile', function(){
    this.timeout(100000);
    before(function(done){
      cleanDir(function(){
        prepareDir(function(){
          runCompyWith('install', function(){
            runCompyWith('compile', done);
          });
        });
      })
    })
    it('should exists /dist folder', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/dist')).to.be.ok;
      done();
    })
    it('folder should contain index.html and app.js files', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/dist/index.html')).to.be.ok;
      expect(fs.existsSync(__dirname + '/tempdata/dist/app.js')).to.be.ok;
      done();
    })
    it('app.js should contain special string', function(done){
      expect(fs.readFileSync(__dirname + '/tempdata/dist/app.js').toString()).to.contain('/* test string */');
      done();
    })
    it('some.tocopy.tst file should exists in /dist folder', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/dist/some.tocopy.tst')).to.be.ok;
      done();
    })
  })



  
})


function runCompyWith(comands, done){
  var args = [__dirname + '/../bin/compy'].concat(comands);
  if(fake){
    var oldDir = process.cwd();
    process.chdir(__dirname + "/tempdata");
    var oldArgv = process.argv;
    process.argv = ['node','mocha'].concat(comands);
    var oldExit = process.exit;
    var oldRequire = Object.keys(require.cache);
    process.exit = function(code){
      process.exit = oldExit;
      process.chdir(oldDir);
      process.argv = oldArgv;
      Object.keys(require.cache).forEach(function(reqModule){
        if(!~oldRequire.indexOf(reqModule)){
          delete require.cache[reqModule];
        }
      })
      return done();
    }
    require('../bin/compy');

    return;
  }
  var compy = spawn('node', args, {cwd: __dirname + "/tempdata" });
  compy.on('close', function(){
    done()
  });
  compy.stdout.on('data', function(data){
    console.log(data.toString());
  })
  compy.stderr.on('data', function(data){
    console.log(data.toString());
  })
}

function prepareDir(done){
  fs.copyRecursive( __dirname + '/testdata', __dirname + '/tempdata', done);
}

function cleanDir(done){
  fs.rmrf( __dirname + '/tempdata', done);
}
