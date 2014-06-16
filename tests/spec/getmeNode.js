'use strict';

var jasmineRequire = require('../lib/jasmine-2.0.0/jasmine.js');
var jasmineRequireConsole = require('../lib/jasmine-2.0.0/console.js');
var getme = require ('getme').getme(this);
var spec = require('./getme.js').spec;

//console.log(spec.toString());
//
//extend(jasmineRequire, jasmineRequireConsole);

jasmineRequireConsole.console(jasmineRequireConsole, jasmineRequire);


var jasmine = jasmineRequire.core(jasmineRequire);

/**
 Starting with version 2.0, this file "boots" Jasmine, performing all of the necessary initialization before executing the loaded environment and all of a project's specs. This file should be loaded after `jasmine.js`, but before any project source files or spec files are loaded. Thus this file can also be used to customize Jasmine for a project.

 If a project is using Jasmine via the standalone distribution, this file can be customized directly. If a project is using Jasmine via the [Ruby gem][jasmine-gem], this file can be copied into the support directory via `jasmine copy_boot_js`. Other environments (e.g., Python) will have different mechanisms.

 The location of `boot.js` can be specified and/or overridden in `jasmine.yml`.

 [jasmine-gem]: http://github.com/pivotal/jasmine-gem
 */

    /**
     * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
     */

    /**
     * Create the Jasmine environment. This is used to run all specs in a project.
     */
    var env = jasmine.getEnv();

    /**
     * ## The Global Interface
     *
     * Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
     */
    var jasmineInterface = {
        describe: function(description, specDefinitions) {
            return env.describe(description, specDefinitions);
        },

        xdescribe: function(description, specDefinitions) {
            return env.xdescribe(description, specDefinitions);
        },

        it: function(desc, func) {
            return env.it(desc, func);
        },

        xit: function(desc, func) {
            return env.xit(desc, func);
        },

        beforeEach: function(beforeEachFunction) {
            return env.beforeEach(beforeEachFunction);
        },

        afterEach: function(afterEachFunction) {
            return env.afterEach(afterEachFunction);
        },

        expect: function(actual) {
            return env.expect(actual);
        },

        pending: function() {
            return env.pending();
        },

        spyOn: function(obj, methodName) {
            return env.spyOn(obj, methodName);
        },

        jsApiReporter: new jasmine.JsApiReporter({
            timer: new jasmine.Timer()
        })
    };

    extend(global, jasmineInterface);

    /**
     * Expose the interface for adding custom equality testers.
     */
    jasmine.addCustomEqualityTester = function(tester) {
        env.addCustomEqualityTester(tester);
    };

    /**
     * Expose the interface for adding custom expectation matchers
     */
    jasmine.addMatchers = function(matchers) {
        return env.addMatchers(matchers);
    };

    /**
     * Expose the mock interface for the JavaScript timeout functions
     */
    jasmine.clock = function() {
        return env.clock;
    };

    /**
     * ## Runner Parameters
     *
     */

    /**
     * ## Reporters
     * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
     */
    var consoleReporter = new jasmineRequire.ConsoleReporter({
        print: console.log,
        onComplete: function (complete) {
            console.log(complete);
        },
        timer: new jasmine.Timer()
    });

    /**
     * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
     */
    env.addReporter(jasmineInterface.jsApiReporter);
    env.addReporter(consoleReporter);
//
//    /**
//     * Filter which specs will be run by matching the start of the full name against the `spec` query param.
//     */
//    var specFilter = new jasmine.HtmlSpecFilter({
//        filterString: function() { return queryString.getParam("spec"); }
//    });
//
//    env.specFilter = function(spec) {
//        return specFilter.matches(spec.getFullName());
//    };
//

global.jasmine = jasmine;


    /**
     * Helper function for readability above.
     */
    function extend(destination, source) {
        for (var property in source) destination[property] = source[property];
        return destination;
    }

spec(getme, this);

env.execute();
