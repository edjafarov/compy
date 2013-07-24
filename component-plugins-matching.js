var effectHash = {
  "component-stylus-plugin":{
    styles:[".styl"]
  },
  "component-jade":{
    templates:[".jade"]
  },
  "component-coffee":{
    scripts:[".coffee"]
  },
  "component-sass":{
    styles:[".scss"]
  },
  "component-builder-handlebars":{
    templates:[".hbl"]
  },
  "component-hogan":{
    templates:[".stache",".mustache"]
  },
  "component-sass":{
    styles:[".scss"]
  },
  "component-json":{
    files:[".json"]
  },
  "component-roole":{
    styles:[".roo"]
  },
  "component-less":{
    styles:[".less"]
  },
  "component-markdown":{
    templates:[".md",".markdown"]
  },
  "component-html":{
    templates:[".html"]
  }
}
function matchModules(config, plugins){
  plugins.forEach(function(plugin){
    if(effectHash[plugin]){
      for(var type in effectHash[plugin]){
        if(!config.src[type]) config.src[type] = [];
        effectHash[plugin][type].forEach(function(ext){
          config.src[type].push(config.targetBase + "/**/*" + ext);
        })
      }
    }
  });
}

module.exports = matchModules;

