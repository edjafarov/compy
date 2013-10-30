[![NPM version](https://badge.fury.io/js/compy.png)](http://badge.fury.io/js/compy)
[![Dependency Status](https://gemnasium.com/edjafarov/compy.png)](https://gemnasium.com/edjafarov/compy)
[![Build Status](https://travis-ci.org/edjafarov/compy.png?branch=master)](https://travis-ci.org/edjafarov/compy)
compy - lightweight app builder/compiller
=====
Compy is a lightweight approach for developing web apps (framework/lib agnostic). Based on TJ's [component](https://github.com/component/component) package manager it allows you to install components and use them in your code right away.
Compy makes your development fun because:

* you can install and use components without any configurations
* you can use local ```require```
* you can use coffeescript, sass, jade and other [plugins](#plugins)
* you can run karma tests
* you will have livereload with simple static server

watch [screencast](http://vimeo.com/edjafarov/compy-intro) for live intro.

##install

```$ npm install compy -g```

##plugins
compy can use component's [plugins](https://github.com/component/component/wiki/Plugins) to extend it's functionality. For example if you want to use coffee in your project, you need to ```npm install component-coffee``` in your project's folder.

compy was tested with following plugins:
- [rschmukler/component-stylus-plugin](https://github.com/rschmukler/component-stylus-plugin) — precompile stylus
- [segmentio/component-jade](https://github.com/segmentio/component-jade) — precompile jade templates
- [anthonyshort/component-coffee](https://github.com/anthonyshort/component-coffee) - require CoffeeScript files as scripts
- [anthonyshort/component-sass](https://github.com/anthonyshort/component-sass) - compile Sass files using node-sass
- [kewah/component-builder-handlebars](https://github.com/kewah/component-builder-handlebars) - precompile Handlebars templates
- [ericgj/component-hogan](https://github.com/ericgj/component-hogan) - Mustache transpiler for component (using Hogan)
- [segmentio/component-sass](https://github.com/segmentio/component-sass) — Sass transpiler for component
- [segmentio/component-json](https://github.com/segmentio/component-json) — Require JSON files as Javascript.
- [queckezz/component-roole](https://github.com/queckezz/component-roole) — Compile [Roole](http://roole.org) files
- [bscomp/component-lesser](https://github.com/bscomp/component-lesser) - [LESS](https://github.com/less/less.js) transpiler for compy
- [segmentio/component-markdown](https://github.com/segmentio/component-markdown) - Compile Markdown templates and make them available as Javascript strings.


## cli comands
```
  Usage: compy <command> [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -d, --dir <path>           project source path. Must contain package.json
    -o, --output <path>        output directory for build/compile
    -v, --verbose              verbosity
    -f, --force                force installation of packages
    -s, --staticServer <path>  custom server that serves static with compy middleware
        --dev                  install dev dependencies

  Commands:

    install [name ...]      install dependencies or component
    compile                 compile app (in dist folder by default)
    build                   build the app (compile and minify sources)
    server [watch]          run static server. If "watch" option enabled - watch changes, recompile and push livereload
    test                    run karma tests
    watch                   watch and rebuild assets on change
    plate [appname]         generate boilerplate package.json
    graph                   show all dependencies/versions installed


```
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
      "component/jquery": "*"
    },
    "main": "app.js"
  }
}
```

## writing tests
To run karma based tests with compy. The package.json configuration should be adjusted and all required karma plugins should be installed. For example to run mocha tests with sinon and chai inside phantomjs following configurations should be set:

```json
{
  ...
  "compy":{
     ...
     "tests":{
      "frameworks":[
        "mocha", "sinon-chai"
      ],
      "plugins":[
        "karma-mocha",
        "karma-sinon-chai",
        "karma-phantomjs-launcher"
      ]
    }
  }
}
```
And plugins should be installed locally.

```$ npm install karma-mocha karma-sinon-chai karma-phantomjs-launcher```

now with ```compy test``` all *.spec.js files will be runned as a mocha tests.

## license

MIT

