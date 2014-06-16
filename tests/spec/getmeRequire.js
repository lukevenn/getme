requirejs.config({
    baseUrl: '../src',
    paths: {
        spec: '../tests/spec'
    }
});
require([
    'getme',
    'spec/getme'
], function (getme, spec) {
    spec(getme); // pass 'getme' into the spec - we could have done this in the spec but I prefer it here
    jasmine.getEnv().execute(); // run the tests
});