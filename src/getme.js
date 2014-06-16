// getme.js
// 2014-05-22

// Copyright (c) 2014 Luke Venn

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The Software shall be used for Good, not Evil.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function (factory) {
    'use strict';

    if (typeof exports === 'object') {
        exports.getme = factory; // export for node
    } else if (typeof define === 'function' && define.amd) {
        // allow AMD use - no module name passed to help avoid conflicts
        define(function () {
            return factory(window);
        });
    } else {
        window.getme = factory(window); // create 'root' reference
    }
}(function (root) {
    'use strict';

    function getme(base, path) {
        var obj,
            current,
            valueTester,
            memo;

        /**
         * @name argumentsToArray
         * @description Converts and arguments object into an array - removing any leading values if required
         * @param {Object} args An arguments object
         * @param {Number} [fromIndex] Index to convert from
         * @returns {Array}
         */
        function argumentsToArray(args, fromIndex) {
            return Array.prototype.slice.call(args, fromIndex || 0);
        }

        /**
         * @name recurseValue
         * @description Recursively calls methods until it is not return a method
         * @param {*} prop The value to try and recurse
         * @returns {*}
         */
        function recurseValue(prop) {
            var args;
            if (typeof prop === 'function') {
                args = argumentsToArray(arguments, 1);
                return recurseValue(prop.apply(obj, args));
            }
            return prop;
        }

        /**
         * @name persist
         * @description Sets 'current' to undefined as the have reached a point where the is no value
         * @param {String} propStr The property name value so that we can detect when the value should be returned
         * @returns {*} 'persist' function or the value of 'current'
         */
        function persist(propStr) {
            if (current === null) {
                current = undefined; // if they get to this point then they've hit a dead end
            }

            // return 'persist' function to continue chain if they added a property or return the value
            return propStr ? persist : current;
        }

        // add the run, rec and val methods so that they can still be used in the chain without causing an error
        persist.run = persist.rec = persist.val = persist;

        /**
         * @name runStored
         * @description runs the stored function with the arguments it was passed
         */
        function runStored() {
            if (memo.func && memo.args) {
                memo.func.apply(null, memo.args);
            }
        }


        /**
         * @name updateObj
         * @description Updates the current value of 'obj' and return 'valueTester' to continue chaining or if we are at
         * a value that cannot be dug into further then return the 'persist' function to allow chaining to continue
         * without breaking
         * @returns {Function} Either 'persist' or 'valueTester'
         */
        function updateObj() {
            if (current === undefined || current === null) {
                return persist;
            }
            obj = current;
            return valueTester;
        }

        /**
         * @name getFromString
         * @description returns a value or undefined from a dot syntax string
         * @param {*} startObj The object to use as the root
         * @param {String} path A dot syntax string to a property
         * @returns {*}
         */
        function getFromString(startObj, path) {
            var splitStr, nextProp, next, args;

            splitStr = path.split('.'); // get the component parts of the path
            obj = startObj; // create a local start point reference to change

            while (splitStr.length > 0 && obj !== undefined) {
                // if the current value is null then convert to undefined and exit loop as we cannot go deeper
                if (obj === null) {
                    obj = undefined;
                    return;
                }

                nextProp = splitStr.shift();
                next = obj[nextProp]; // get the next value so we can test it's type to see if we've reached an end

                if (next === undefined || splitStr.length === 0) {
                    return next; // end of path
                }

                args = argumentsToArray(arguments, 2); // get any arguments passed
                obj = recurseValue.apply(null, [next].concat(args)); // get the next value
            }

            return obj;
        }

        /**
         * @name valueTester
         * @description Tries to get the value related to the property string passed
         * @param {String} propStr The property name string (or dot syntax string) we want to try and retrieve
         * @returns {*}
         */
        function test(propStr) {
            var args;
            current = obj[propStr];

            args = memo.args.slice(1); // get the arguments from the memory (memo) object

            if (args.length === 0) {
                // get the value - the last value of a dot syntax string or a single value will be passed as it
                current = getFromString(obj, propStr);
            }
            if (typeof current === 'function') {
                // recurse the value only if a function as all other recursion should have been performed by 'getFromString'
                current = recurseValue.apply(null, [current].concat(args));
            }
        }

        /**
         * @name val
         * @description Returns the property without attempting any recursion - useful when there is part of the path
         * that you want as is; for example a function with properties or Class with static methods
         * @param {String} propStr
         */
        function val(propStr) {
            current = obj[propStr];
        }

        /**
         * @name rec
         * @description Tries to perform recursion on the property - Useful where that last property is a function that
         * needs to use recursion to get the ultimately desired value
         * @param {String} propStr
         * @param {...*} [rest] Any other arguments that you wish to use when calling the function; they will not
         * be used beyond the initial call so not used on any functions called recursively (if you wish to do so use run
         * instead)
         */
        function rec(propStr, rest) {
            var args = memo.args.slice(1); // get the arguments from the memory (memo) object
            current = recurseValue.apply(null, [obj[propStr]].concat(args));
        }

        /**
         * @name run
         * @description Runs or calls the function only once - useful if the function is part of a path and you do not
         * need to perform recursion on it but it needs to be called once to get the value
         * @param {String} propStr
         * @param {...*} [rest] Any other arguments that you wish to use when calling the function
         */
        function run(propStr, rest) {
            var args;

            if (typeof obj[propStr] === 'function') {
                args = memo.args.slice(1); // get the arguments from the memory (memo) object
                current = obj[propStr].apply(obj, args);
            } else {
                current = obj[propStr];
            }
        }

        memo = {};

        /**
         * @name valueTester
         * @description Tries to get the value related to the property string passed
         * @param {String} propStr The property name string (or dot syntax string) we want to try and retrieve
         * @returns {*}
         */
        valueTester = function (propStr) {
            if (propStr === undefined) {
                if (memo.func !== test) {
                    runStored();
                    updateObj();
                } else {
                    obj = getFromString(obj, memo.args[0]);
                }
                return obj;
            }
            runStored();
            memo.func = test;
            memo.args = argumentsToArray(arguments);
            return updateObj();
        };

        /**
         * @name val
         * @memberOf valueTester
         * @description Returns the property without attempting any recursion - useful when there is part of the path
         * that you want as is; for example a function with properties or Class with static methods
         * @param {String} propStr
         * @returns {Function}
         */
        valueTester.val = function (propStr) {
            runStored();
            memo.func = val;
            memo.args = argumentsToArray(arguments);
            return updateObj();
        };

        /**
         * @name rec
         * @memberOf valueTester
         * @description Tries to perform recursion on the property - Useful where that last property is a function that
         * needs to use recursion to get the ultimately desired value
         * @param {String} propStr
         * @param {...*} [rest] optional any other arguments that you wish to use when calling the function; they will not
         * be used beyond the initial call so not used on any functions called recursively
         * @returns {Function}
         */
        valueTester.rec = function (propStr, rest) {
            runStored();
            memo.func = rec;
            memo.args = argumentsToArray(arguments);
            return updateObj();
        };

        /**
         * @name run
         * @memberOf valueTester
         * @description Runs or calls the function only once - useful if the function is part of a path and you do not
         * need to perform recursion on it but it needs to be called once to get the value
         * @param {String} propStr
         * @param {...*} [rest] optional any other arguments that you wish to use when calling the function
         * @returns {Function}
         */
        valueTester.run = function (propStr, rest) {
            runStored();
            memo.func = run;
            memo.args = argumentsToArray(arguments);
            return updateObj();
        };

        if (typeof base === 'string') {
            return getFromString(root, base); // no start object passed in so use the root (i.e. window in a browser)
        }
        if (typeof path === 'string') {
            return getFromString(base, path); // a dot syntax path also passed so just use that
        }

        obj = current = base; // set the object ready for chaining

        return valueTester;
    }

    return getme;
}));
