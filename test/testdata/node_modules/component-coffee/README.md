# component-coffee

Component plugin to compile CoffeeScript files on-the-fly. This allows you to write components in CoffeeScript.

## Installation

```
npm install component-coffee
```

## Usage

```
component build --use component-coffee
```

Add you CoffeeScript files to the `scripts` section of your `component.json`

```
{
  "name": "foo",
  "scripts": ["index.coffee", "foo.coffee", "bar.coffee"]
}
```

Now in your `index.coffee` file you can require it:

```
foo = require 'foo'
bar = require 'bar'
```