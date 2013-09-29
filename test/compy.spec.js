var fs = require('fs.extra');
var spawn = require('child_process').spawn;
var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');
var request = require('request');


var fake = !process.env.NOCK_OFF;

describe("compy should", function(){
  after(cleanDir);

  xdescribe('install', function(){
    this.timeout(100000);
    var github = nock('https://raw.github.com:443')
    .get('/component/model/master/component.json')
    .reply(200,JSON.stringify({}),{'content-type': 'text/plain; charset=utf-8'});
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

  xdescribe('install <component name> - component/domify', function(){
    this.timeout(100000);
    var github = nock('https://raw.github.com:443')
    .get('/component/domify/master/component.json')
    .reply(200,JSON.stringify({}),{'content-type': 'text/plain; charset=utf-8'});

    before(function(done){
      cleanDir(function(){
        prepareDir(function(){
          runCompyWith(['install','component/domify'], done);
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

  xdescribe('compile #compile', function(){
    this.timeout(100000);
    var github = nock('https://raw.github.com:443')
    .get('/component/model/master/component.json')
    .reply(200,JSON.stringify({}),{'content-type': 'text/plain; charset=utf-8'});

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
    it('some.tocopy.tst file should exists in /dist folder [local GRUNTFILE test]', function(done){
      expect(fs.existsSync(__dirname + '/tempdata/dist/some.tocopy.tst')).to.be.ok;
      done();
    })

    it('.coffee script files should be compiled in javascript', function(done){
      expect(fs.readFileSync(__dirname + '/tempdata/dist/app.js').toString()).to.contain('if (opposite_check) {');
      done();
    })
  })



  describe('set static server', function(){
    this.timeout(100000);
    var github = nock('https://raw.github.com:443')
    .get('/component/model/master/component.json')
    .reply(200,JSON.stringify({}),{'content-type': 'text/plain; charset=utf-8'});

    before(function(done){
      cleanDir(function(){
        prepareDir(function(){
          runCompyWith('install', function(){
            runCompyWith('compile', function(){
              runCompyWith('server');
              done();
            });
          });
        });
      })
    })
    it('should ping localhost port 8080', function(done){
      request.get("http://localhost:8080", function(err, res, body){
        expect(res).to.have.property("statusCode", 200);
        expect(body).to.be.ok;
        request.get("http://localhost:8080/app.js", gotJs);
      })
      function gotJs(err, res, body){
        expect(res).to.have.property("statusCode", 200);
        expect(body).to.be.ok;
        request.get("http://localhost:8080/app.css", gotCss);
      }
      function gotCss(err, res, body){
        expect(res).to.have.property("statusCode", 200);
        expect(body).to.be.ok;
        done();
      }
    })
  })
})



//TODO: plugins real plugins for working jade/coffescript
//TODO: run real app (should work) I guess math will work ok
//TODO: test templating
//TODO: test - karma testing
//TODO: test building
//TODO: test standalone libs

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
      return done && done();
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
