module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      prod: {
        files: {
          'assets/js/surprise.min.js': [
            'assets/js/surprise.js'
          ]
        }
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['assets/**'],
            dest: 'dist/'
          }
        ]
      }
    },
    assemble: {
      options: {
        flatten: true,
        assets: 'dist/assets',
        layout: 'layout/default.hbs',
        partials: 'partials/*.hbs'
      },
      dist:{
        files: {
          'dist': ['pages/*.hbs' ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('assemble');
  grunt.registerTask('default', ['uglify', 'copy', 'assemble']);
};
