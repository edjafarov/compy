var fs = require('fs.extra');
var spawn = require('child_process').spawn;
var expect = require('chai').expect;


describe("compy should", function(){
  after(cleanDir);

  describe('install', function(){
    this.timeout(100000);
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
