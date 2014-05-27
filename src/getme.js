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
;
(function (root) {
    'use strict';

    function getme(base, path) {
        var obj, current, previous, valueTester, getFromString, updateObj;

        /**
         * @name argumentsToArray
         * @description Converts and arguments object into an array - removing any leading values if required
         * @param {Object} args An arguments object
         * @param {Number} fromIndex Index to convert from
         * @returns {Array}
         */
        function argumentsToArray(args, fromIndex) {
            return Array.prototype.slice.call(args, fromIndex || 0);
        }

        /**
         * @name recurseValue
         * @description Recursively calls methods until it is not return a method
         * @param {*} val The value to try and recurse
         * @returns {*}
         */
        function recurseValue(val) {
            var args;
            if (typeof val === 'function') {
                args = argumentsToArray(arguments, 1);
                return recurseValue(val.apply(obj, args));
            }
            return val;
        }

        /**
         * @name persist
         * @description Persists the last value if null or undefined so we can continue chaining without throwing errors
         * @param {String} val The property name value so that we can detect when the value should be returned
         * @returns {*}
         */
        function persist(val) {
            if (val) {
                if (current === null) {
                    // if the current value is null and they have tried to get another value then convert it to undefined
                    current = void 0;
                }
                return persist; // return itself to continue chaining
            }
            return current; // return the current value (either null or undefined)
        }

        // add the run, rec and val methods so that they can still be used in the chain without causing an error
        persist.run = persist.rec = persist.val = persist;

        /**
         * @name getFromString
         * @description returns a value or undefined from a dot syntax string
         * @param {*} startObj The object to use as the root
         * @param {String} path A dot syntax string to a property
         * @returns {*}
         */
        getFromString = function (startObj, path) {
            var splitStr, nextProp, next, args;

            splitStr = path.split('.'); // get the component parts of the path
            obj = startObj; // create a local start point reference to change

            while (splitStr.length > 0 && typeof obj !== 'undefined') {
                // if the current value is null then convert to undefined and exit loop as we cannot go deeper
                if (obj === null) {
                    obj = void(0);
                    return;
                }

                nextProp = splitStr.shift();
                next = obj[nextProp]; // get the next value so we can test it's type to see if we've reached an end

                if (typeof next === 'undefined' || splitStr.length === 0) {
                    return next; // end of path
                }

                args = argumentsToArray(arguments, 2); // get any arguments passed
                obj = recurseValue.apply(null, [next].concat(args)); // get the next value
            }

            return obj;
        };

        /**
         * @name updateObj
         * @description Updates the current value of 'obj' and return 'valueTester' to continue chaining or if we are at
         * a value that cannot be dug into further then return the 'persist' function to allow chaining to continue
         * without breaking
         * @returns {Function} Either 'persist' or 'valueTester'
         */
        updateObj = function () {
            if (typeof current === 'undefined' || current === null) {
                return persist;
            }
            obj = current;
            return valueTester;
        };

        /**
         * @name valueTester
         * @description Tries to get the value related to the property string passed
         * @param {String} val The property name string (or dot syntax string) we want to try and retrieve
         * @returns {*}
         */
        valueTester = function (val) {
            // TODO - change it so that the chain is always one behind so that unnecessary recursion is avoided

            var args;
            if (typeof val === 'undefined') {
                // if the last property in the chain was a function then return this rather than it's recursed value
                if (typeof previous === 'function') {
                    return previous;
                }

                return obj;
            }

            current = obj[val];

            args = argumentsToArray(arguments, 1); // convert the arguments

            if (args.length === 0) {
                // get the value - the last value of a dot syntax string or a single value will be passed as it
                current = getFromString(obj, val);
            }
            // store the value so that if it is a function we can return it if it turns out to be the last in the chain
            previous = current;
            if (typeof current === 'function') {
                // recurse the value only if a function as all other recursion should have been performed by 'getFromString'
                current = recurseValue.apply(null, [current].concat(args));
            }

            return updateObj(); // update the 'obj' variable
        };

        /**
         * @name val
         * @memberOf valueTester
         * @description Returns the property without attempting any recursion - useful when there is part of the path
         * that you want as is; for example a function with properties or Class with static methods
         * @param {String} val
         * @returns {Function}
         */
        valueTester.val = function (val) {
            current = obj[val];
            return updateObj();
        };

        /**
         * @name rec
         * @memberOf valueTester
         * @description Tries to perform recursion on the property - Useful where that last property is a function that
         * needs to use recursion to get the ultimately desired value
         * @param {String} val
         * @param {*} ...rest optional any other arguments that you wish to use when calling the function; they will not
         * be used beyond the initial call so not used on any functions called recursively
         * @returns {Function}
         */
        valueTester.rec = function (val) {
            var args = argumentsToArray(arguments, 1);
            current = recurseValue.apply(null, [obj[val]].concat(args));
            return updateObj();
        };

        /**
         * @name run
         * @memberOf valueTester
         * @description Runs or calls the function only once - useful if the function is part of a path and you do not
         * need to perform recursion on it but it needs to be called once to get the value
         * @param {String} val
         * @param {*} ...rest optional any other arguments that you wish to use when calling the function
         * @returns {Function}
         */
        valueTester.run = function (val) {
            var args;

            if (typeof obj[val] === 'function') {
                args = argumentsToArray(arguments, 1);
                current = obj[val].apply(obj, args);
            } else {
                current = obj[val];
            }

            return updateObj();
        };

        if (typeof base === 'string') {
            return getFromString(root, base); // no start object passed in so use the root (i.e. window in a browser)
        } else if (typeof path === 'string') {
            return getFromString(base, path); // a dot syntax path also passed so just use that
        }

        obj = current = base; // set the object ready for chaining

        return valueTester;
    }

    if (typeof exports === 'object') {
        exports.getme = getme; // export for node
    } else {
        root.getme = getme; // create 'root' reference
    }

    return getme;
}(this));
