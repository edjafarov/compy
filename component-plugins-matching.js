var effectHash = {
  "component-stylus-plugin":{
    ext:{
      styles:[".styl"]
    }
  },
  "component-jade":{
    ext:{
      templates:[".jade"]
    }
  },
  "component-coffee":{
    ext:{
      scripts:[".coffee"]
    }
  },
  "component-sass":{
    ext:{
      styles:[".scss"]
    }
  },
  "component-builder-handlebars":{
    ext:{
      templates:[".hbs"]
    },
    run: function(plugin, builder){
      builder.use(plugin());
    }
  },
  "component-hogan":{
    ext:{
      templates:[".stache",".mustache"]
    }
  },
  "component-sass":{
    ext:{
      styles:[".scss"]
    }
  },
  "component-json":{
    ext:{
      files:[".json"]
    }
  },
  "component-roole":{
    ext:{
      styles:[".roo"]
    }
  },
  "component-less":{
    ext:{
      styles:[".less"]
    }
  },
  "component-markdown":{
    ext:{
      templates:[".md",".markdown"]
    },
    run: function(plugin, builder){
      builder.use(plugin());
    }
  },
  "component-html":{
    ext:{
      templates:[".html"]
    }
  }
}
function matchModules(config, plugins){
  plugins.forEach(function(plugin){
    if(effectHash[plugin]){
      for(var type in effectHash[plugin].ext){
        if(!config.src[type]) config.src[type] = [];
        effectHash[plugin].ext[type].forEach(function(ext){
          config.src[type].unshift(config.targetBase + "/**/*" + ext);
        })
      }
    }
  });
}
matchModules.config = effectHash;
module.exports = matchModules;

