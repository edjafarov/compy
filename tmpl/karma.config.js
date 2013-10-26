module.exports = function(config){
  config.set({
    frameworks: ['mocha'],
    files: [
      process.env.targetBase + "/dist/test.js",
      process.env.targetBase + "/dist/runner.js"
    ]
  });
}
