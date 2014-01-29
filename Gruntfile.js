module.exports = function(grunt) {
  grunt.initConfig({
    assemble: {
      options: {
        flatten: true,
        assets: 'assets',
        layout: 'layout/default.hbs',
        partials: 'partials/*.hbs',
        data: 'contents/*.json'
      },
      dist:{
        files: {
          'dist': ['pages/*.hbs' ]
        }
      }
    }
  });

  grunt.loadNpmTasks('assemble');
  grunt.registerTask('default', ['assemble']);
};
