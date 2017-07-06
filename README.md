# getme
'getme' is a simple function that allows you to safely retrieve a value from an object path without having to worry
about Reference Errors. To put it simply; if a value exits it gets it for you if not you get undefined.

It can be used in 3 different ways:

1. Using a dot syntax string from a 'global' value
2. Using a dot syntax string from a 'base' object starting point
3. Passing property (or method) names into chained calls

### 1. Using a dot syntax string from a 'global' value

When 'getme' is initialised a 'global' value is passed in (in the browser this will evaluate to window). Any strings
that are passed in will then be evaluated from that point.

For example:

    getme('hello.world');

is the same as

    window.hello.world

_Why?_

The main reason for not eval(uating) the first item in the string is simply to avoid having access to the global 'eval'
method. It is merely added for completeness sake.

### 2. Using a dot syntax string from a 'base' object starting point

The second way of using 'getme' allows you to pass in a starting point object that can be any object you like.

To recreate the example above you would use:

    getme(window, 'hello.world');

_Why?_

This allows us to use the same simple dot syntax without having the limitation of only being able to use it on global paths.

### 3. Passing property values into 'chained' calls

The third way of using 'getme' is the more complicated but more powerful method. In this style each part of the path is
put into separate function calls.

To recreate the first example you would use:

    getme(window)('hello')('world')();

    // or

    getme(window)('hello.world')();

The parenthesis at the end tell the calls to return whatever was found (either a value or undefined)

_Why?_

The reason for using this method is that it allows us much more control in how we find the object as will be shown later.

### An excursion into recursion - A brief note on how 'getme' handles 'getters' in paths (and methods generally)

When 'getme' encounters a method in a path it will, by default, call that method recursively until it is no longer
returned a function. The exception to this is where the last value listed is itself a method; in this instance the
method will be returned. The assumption is that any methods listed in the path are getters so will not require any
arguments and can be called freely.

If any of the methods in the path do require arguments to be passed in then you should use the 'chained' calls version
\- see below API for examples.

If the last item in the list is a 'getter' and you want to be returned that value then, again, the 'chained' version can
help. There are 'run' or 'rec' methods that allow this - see below for API and examples.

**Note**

If you use either of the dot syntax string varieties, don't add required arguments or the recursion hits a function
that requires arguments then an error could be thrown; 'getme' is not responsible for handling any of these errors so it
doesn't.

##'getme' API

The below methods are only available when using the 'chained' version.

### val
__Usage__:

    val(String property)

__Description__:

Uses the exact value without performing any recursion on methods (properties are returned as normal). This could be used
to get static methods on name-spaced classes for example.

__Parameters__:

    val {String} The property / method name you wish to retrieve

__Example__:

    var startObj = {
        MyClass: function () {
            //do nothing
        }
    }

    startObj.MyClass.static = function () {
        // do something statically
    }

    startObj.MyClass.constant = 'iAmConstantAndUnchanging';

    // without 'val'
    getme(startObj)('MyClass')('static')(); // returns undefined
    getme(startObj)('MyClass')('constant')(); // returns undefined

    // with 'val'
    getme(startObj).val('MyClass')('static')(); // returns startObj.MyClass.static method
    getme(startObj).val('MyClass')('constant')(); // returns 'iAmConstantAndUnchanging'


### run
__Usage__:

    run(String property [, ...rest])

__Description__:

Runs, or calls, a function only once with no recursion. Can be called at any point in the chain.

__Parameters__:

    val {String} The method name you wish to call (if a property name is entered then the value of this will be returned)
    ...rest {*} Any additional arguments you wish to pass into the method when it is called

__Example__:

    var startObj = {
        aChild: {
            aChildsMethod: function () {
                return 'hello world';
            }
        },
        aMethod: function () {
            var innerFunc = function () {
                return 'nothing'
            }
            innerFunc.helloWorld = 'hello world';
            return innerFunc;
        }
    }

    // without 'run'
    getme(startObj)('aMethod')('helloWorld')(); // returns undefined
    getme(startObj)('aChildsMethod')('aMethod')(); // returns startObj.aChild.aChildsMethod method

    // with 'run'
    getme(startObj).run('aMethod')('helloWorld')(); // returns 'hello world';
    getme(startObj)('aChildsMethod').run('aMethod')(); // returns 'hello world'

if you are thinking that if the last property in the list is a method then I can just do this

    getme(startObj)('aChildsMethod')('aMethod')()(); // returns 'hello world'

then you are correct; but if the method doesn't exist then you will get an error like so

    getme(startObj)('aChildsMethod')('noneExistantMethod')()(); // throws error


### rec
__Usage__:

    rec(String property [, ...rest])

__Description__:

Runs, or calls, a function recursively. Can be called at any point in the chain but since this is the default behaviour
this is more for the case where the method is that last property in the list.

__Parameters__:

    val {String} The method name you wish to call (if a property name is entered then the value of this will be returned)
    ...rest {*} Any additional arguments you wish to pass into the method when it is called

__Example__:

    var startObj = {
        aMethod: function () {
            return function () {
                return 'hello world'
            }
        }
    }

    // without 'rec'
    getme(startObj)('aMethod')(); // returns startObj.aMethod method

    // with 'rec'
    getme(startObj).rec('aMethod')(); // returns 'hello world';

