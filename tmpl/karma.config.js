module.exports = function(config){
  config.set({
    frameworks: ['mocha'],
    files: [
      process.env.destBase + "/test.js",
      process.env.destBase + "/runner.js"
    ]
  });
}
