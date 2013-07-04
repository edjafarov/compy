[![Build Status](https://travis-ci.org/edjafarov/compy.png?branch=master)](https://travis-ci.org/edjafarov/compy)
compy - rapid frontend development cli tool
=====
Compy is a cli that allows to raise frontend development usability to the next level. It allows you to install components and use them in your code right away. Compy uses TJ's components so it have all capabilities including local require and building the project

watch [screencast](http://www.youtube.com/watch?v=IYSPHvw2KSk)

### features
* installed components wire up instantly
* local require
* local static server +livereload
* componentjs packages support
* grunt extendable

#### todo:
- instant karma based tests
- tbd

## cli comands
* ```install[:<component>]``` - installs components from dependencies. With argument installs component, automatically saves it inside package.json
* ```compile``` - compiles the project in ```dist``` folder
* ```server[:watch]``` - runs simple http server for dist folder. With ```watch``` argument server watches the changes in source and recompiles the project.
* ```build``` - builds (compiles + minifies) the project in ```dist``` folder

## config
The configuration for compy sits in package.json inside component namespace. ```main``` is an entry point of your app and the only required property.

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

