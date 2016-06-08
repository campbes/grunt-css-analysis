var analyzecss = require('analyze-css');
var fs = require('fs');

module.exports = function(grunt) {

  var MultiReporter = require('violation-reporter')(grunt);
  var XMLReporter = require('violation-reporter/tasks/XML')(grunt);
  var pmdReporter = require('violation-reporter/tasks/PmdXML')(grunt, XMLReporter);
  var checkstyleReporter = require('violation-reporter/tasks/CheckstyleXML')(grunt, XMLReporter);
  var consoleReporter = require('violation-reporter/tasks/Console')(grunt);
  var dotsReporter = require('violation-reporter/tasks/Dots')(grunt);

  var defaults = {
    fail: true,
    failOn: 'error',
    thresholds: {
      error: 0.5,
      warning: 0.75
    },
    analyzecss: {
      "base64Length": 10000,
      "redundantBodySelectors": 0,
      "redundantChildNodesSelectors": 0,
      "colors": 30,
      "comments": 0,
      "commentsLength": 0,
      "complexSelectors": 100,
      "complexSelectorsByAttribute": 20,
      "duplicatedSelectors": 0,
      "duplicatedProperties": 10,
      "emptyRules": 0,
      "expressions": 0,
      "oldIEFixes": 0,
      "imports": 0,
      "importants": 0,
      "mediaQueries": 20,
      "notMinified": 0,
      "multiClassesSelectors": 50,
      "parsingErrors": 0,
      "oldPropertyPrefixes": 0,
      "propertyResets": 0,
      "qualifiedSelectors": 0,
      "specificityIdAvg": 1,
      "specificityIdTotal": 100,
      "specificityClassAvg": 2,
      "specificityClassTotal": 200,
      "specificityTagAvg": 3,
      "specificityTagTotal": 300,
      "selectors": 500,
      "selectorLengthAvg": 3,
      "selectorsByAttribute": 50,
      "selectorsByClass": 100,
      "selectorsById": 100,
      "selectorsByPseudo": 50,
      "selectorsByTag": 0,
      "universalSelectors": 0,
      "length": 100000,
      "rules": 100,
      "declarations": 1000
    },
    name: 'CSS Analysis Violations'
  };

  function getReporter(files, options) {
    var reporter = new MultiReporter(files, options);
    reporter.addReporter(dotsReporter);
    if (options.console) {
      reporter.addReporter(consoleReporter);
    }
    if (options.pmdXML) {
      reporter.addReporter(pmdReporter);
    }
    if (options.checkstyleXML) {
      reporter.addReporter(checkstyleReporter);
    }
    return reporter;
  }

  grunt.registerMultiTask('cssanalysis', 'Analyzes CSS with analyze-css', function() {

    var done = this.async();

    var files = this.filesSrc || grunt.file.expand(this.file.src);
    var excluded = this.data.exclude;
    var options = this.options(defaults);

    var reporter = getReporter(files, options);


    // Exclude any unwanted files from 'files' array
    if (excluded) {
      grunt.file.expand(excluded).forEach(function(ex){
        files.splice(files.indexOf(ex), 1);
      });
    }

    var results = [];

    function endFile() {
      if (results.length < files.length) {
        return;
      }
      reporter.finish();
      done(options.fail === false || this.errorCount === 0);
    }

    function getSeverity(ratio) {
      if (ratio < options.thresholds.error) {
        return 'error';
      } else if (ratio < options.thresholds.warning) {
        return 'warning';
      }
      return 'info';
    }

    function setFailures(severity) {
      if (options.failOn === 'error' && severity !== 'error') {
        return;
      }
      grunt.fail.errorcount++;
    }

    function processAnalysis(err, analysis, file) {
      if (err) {
        endFile();
      }

      var violations = [];
      var metrics = analysis.metrics;
      var ratio;
      var severity;

      Object.keys(metrics).forEach(function(key) {

        if(metrics[key] === 0) {
          return;
        }

        ratio = options.analyzecss[key] / metrics[key];

        severity = getSeverity(ratio);

        if(severity === 'info') {
          return;
        }

        violations.push({
          filepath: file,
          line: 0,
          column: 0,
          name: key,
          rule: key,
          severity: severity,
          message: 'Too many',
          ratio: ratio,
          value: metrics[key] + ' ('+ options.analyzecss[key] + ')'
        });

        setFailures(severity);

      });

      reporter.violations(file, violations);
      results.push(file);

      endFile();
    }


    reporter.start();

    files.forEach(function(file) {
      fs.readFile(file, {
        encoding: 'UTF-8'
      },function(err, data) {
        if (err) {
          endFile();
        }
        new analyzecss(data, {}, function(err, analysis) {
          processAnalysis(err, analysis, file);
        });
      });
    });
  });

};