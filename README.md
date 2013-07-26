[![NPM version](https://badge.fury.io/js/compy.png)](http://badge.fury.io/js/compy)
[![Dependency Status](https://gemnasium.com/edjafarov/compy.png)](https://gemnasium.com/edjafarov/compy)
[![Build Status](https://travis-ci.org/edjafarov/compy.png?branch=master)](https://travis-ci.org/edjafarov/compy)
compy - lightweight app builder/compiller
=====
Compy is a lightweight approach for developing single page apps (framework/lib agnostic). 
Based on TJ's component.io package manager it allows you to install components and use them in your code right away.
Compy makes your development fun by:

* allowing you to use installed components by just requiring them like in node.js
* providing local ```require```
* seting up local static server with livereload
* supporting componentjs packages
* being flexible and grunt extendable

watch [screencast](http://www.youtube.com/watch?v=IYSPHvw2KSk) for details

#### todo:
- instant karma based tests

##install

```$ npm install compy -g```

## cli comands
* ```install[:<component>]``` - installs components from dependencies. With argument installs component, automatically saves it inside package.json
* ```compile``` - compiles the project in ```dist``` folder
* ```server[:watch]``` - runs simple http server for dist folder. With ```watch``` argument server watches the changes in source and recompiles the project.
* ```build``` - builds (compiles + minifies) the project in ```dist``` folder

## config
The configuration for compy sits in package.json inside compy namespace. ```main``` is an entry point of your app and the only required property.

```json
{                                                                                                                 
  "name": "appName",
  "version": "0.0.0",
  "description": "my awesome app",
  "main": "index.js",
  "license": "BSD",
  "compy": {
    "dependencies": {
      "component/jquery": "*",
      "component/tip": "*",
      "component/s3": "*"
    },
    "main": "app.js"
  }
}
```

## what's about grunt?
Compy is basically a grunt file that does all the magic. You can check it [here](https://github.com/edjafarov/compy/blob/master/Gruntfile.js)
That also mean that is you want to use grunt in your project, you need to know some details.

You can create local ```Grintfile.js``` inside your project. To run tasks though instead of ```grunt <taskname>``` you need to do ```compy <taskname>```

There are ```compile``` and ```build``` tasks which you can extend/change. Original tasks have aliases ```compy-compile``` and ```compy-build``` ([src](https://github.com/edjafarov/compy/blob/588028693f1762cc1f59e9464f7824a2bdafd1ba/Gruntfile.js#L239-L241))

So if you want to precompile something, your grunt file will look like:

```javascript
  ...
  grunt.registerTask('compile',['<precompileTask>','compy-compile'])
  ...
```

## license

MIT

