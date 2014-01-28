module.exports = function(grunt) {
  grunt.initConfig({
    assemble: {
      options: {
        flatten: true,
        assets: "assets",// data:   "config.json" 
        layout: "layout/default.hbs",
        partials: "partials/*.hbs",
      },
      dist:{
        files: {
          'dist': ["pages/*.hbs" ]
        }
      }
    }
  });

  grunt.loadNpmTasks('assemble');
  grunt.registerTask('default', ['assemble']);
};