module.exports = function(grunt){
  grunt.initConfig({
    copy:{
      main: {
        files:{
          'dist/': ['*.tocopy.tst']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('compile', ['compy-compile','copy'])
}
