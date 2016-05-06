## Synopsis

Run analyze-css against CSS files, generating standard-format reports.

## Code Example

    grunt.loadNpmTasks('grunt-css-analysis');
     
    grunt.initConfig({
    
      cssanalysis : {
        css: {
          files : [{ cwd: '.', src: ['/**/*.css'], expand : true}],
          exclude: [],
          options: {
            fail: true, //default
            failOn: 'error', //default
            thresholds: {
                error: 0.5, // error threshold, default 0.5
                warning: 0.75 //warning thredshold, default 0.75
            },    
            pmdXML: '/pmd.xml'
            cssanalyze: {
                // cssanalyse options here
            }
          }
        }
      };
      
    });

## Motivation

This project is based on the excellent [analyze-css](https://github.com/macbre/analyze-css) and its associated grunt task [grunt-analyze-css](https://github.com/DeuxHuitHuit/grunt-analyze-css).

This task does nothing more than run analyze-css, but creates reports in a number of standard XML formats using [violation-reporter](https://github.com/campbes/violation-reporter) for consumption by jenkins various plugins.

## Installation

npm install grunt-css-analysis

## Contributors

Stuart Campbell ([campbes](https://github.com/campbes))

## License

Released under the [MIT License](http://opensource.org/licenses/MIT)
