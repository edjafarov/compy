[![Build Status](https://travis-ci.org/edjafarov/compy.png?branch=master)](https://travis-ci.org/edjafarov/compy)
compy - rapid frontend development cli tool
=====
Compy is a cli that allows to raise frontend development usability to the next level. It allows you to install components and use them in your code right away. Compy uses TJ's components so it have all capabilities including local require and building the project

watch [screencast](http://www.youtube.com/watch?v=IYSPHvw2KSk)

### features
* installed components wire up automatically
* local require
* local static server +livereload
* componentjs packages support

#### todo:
- instant karma based tests
- grunt extendable
- tbd

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
## license

MIT

