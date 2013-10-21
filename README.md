[![NPM version](https://badge.fury.io/js/compy.png)](http://badge.fury.io/js/compy)
[![Dependency Status](https://gemnasium.com/edjafarov/compy.png)](https://gemnasium.com/edjafarov/compy)
[![Build Status](https://travis-ci.org/edjafarov/compy.png?branch=master)](https://travis-ci.org/edjafarov/compy)
compy - lightweight app builder/compiller
=====
Compy is a lightweight approach for developing web apps (framework/lib agnostic). Based on TJ's [component](https://github.com/component/component) package manager it allows you to install components and use them in your code right away.
Compy makes your development fun by:

* allowing you to use installed components without any configurations by just requiring them.
* providing local ```require```
* supporting coffeescript, sass, jade and other [plugins](#plugins)
* giving you livereload with simple static server

watch [screencast](http://www.youtube.com/watch?v=IYSPHvw2KSk) for details [some of functionality was changed in 0.1.3]

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

##install

```$ npm install compy -g```

## cli comands
```
  Usage: compy <command> [options]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

  Commands:

    install [name ...]      install dependencies or component
    compile                 compile app (in dist folder by default)
    build                   build the app (compile and minify sources)
    server [watch]          run static server. If "watch" option enabled - watch changes, recompile and push livereload
    test                    run karma tests
    watch                   watch and rebuild assets on change
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

