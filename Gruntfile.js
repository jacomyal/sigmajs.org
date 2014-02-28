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
          },
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['sigma.js/examples/data/*'],
            dest: 'dist/examples/data/'
          },
          {
            expand: true,
            cwd: 'sigma.js/',
            src: ['plugins/**'],
            dest: 'dist/'
          }
        ]
      }
    },
    sed: {
      version: {
        recursive: true,
        path: 'dist/examples/',
        pattern: /<!-- START SIGMA IMPORTS -->[\s\S]*<!-- END SIGMA IMPORTS -->/g,
        replacement: ['<!-- START SIGMA IMPORTS -->']
          .concat('<script src="../assets/js/sigma.min.js"></script>')
          .concat('<!-- END SIGMA IMPORTS -->').join('\n    ')
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
      },
      examples: {
        // override task-level layout 
        options: {
          flatten: true,
          assets: 'dist/assets',
          layout: 'layout/default.examples.hbs',
          partials: 'partials/*.hbs'
        },
        files: {
          'dist/examples/': ['sigma.js/examples/*.html' ]
        },
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-sed');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('assemble');
  grunt.registerTask('default', ['uglify', 'copy', 'assemble', 'sed']);
};
