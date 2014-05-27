describe('getme', function () {
    'use strict';

    var testObject, ukArea, londonArea, countryType, cityType;

    function resetTestObject () {
        testObject = {
            world: 'world',
            func: function () {
                return 'func';
            },
            nullVal: null,
            uk: {
                type: countryType,
                population: 58000000,
                area: ukArea,
                getSize: function () {
                    return  this.area;
                },
                increaseSize: function (amount) {
                    this.area += amount;
                    return this;
                },
                cityNames: ['London', 'York', 'Glasgow', 'Cardiff'],
                london: {
                    type: cityType,
                    population: 58000000,
                    area: londonArea,
                    getSize: function () {
                        return  this.area;
                    },
                    increaseSize: function (amount) {
                        this.area += amount;
                        return this;
                    },
                    tempSize: function (amount) {
                        return this.area + amount;
                    },
                    nestedFunc: function () {
                        return function () {
                            return function () {
                                return 'nestedFunc';
                            }
                        }
                    },
                    getNestedMe: function () {
                        var that = this;
                        return function () {
                            return function () {
                                return that;
                            }
                        }
                    }
                }
            }
        };

        testObject.uk.getSize.defaultSize = ukArea;
    }

    ukArea = 36000;
    londonArea = 1200;
    countryType = 'country'
    cityType = 'city';


    beforeEach(function () {
        resetTestObject();
    });

    afterEach(function () {
        testObject = void(0);
    });

    it('should return undefined when the base object is undefined', function () {
        var undefinedBase;
        expect(getme(undefinedBase, 'a.made.up.path')).toBeUndefined();
        expect(getme(undefinedBase)()).toBeUndefined();
    });

    it('should return an object from a global object when passed a string', function () {
        window.testObject = testObject;
        expect(getme('testObject.uk')).toBe(testObject.uk);
        expect(getme('testObject.uk.london')).toBe(testObject.uk.london);
    });

    it('should return an object from a base object and string', function () {
        expect(getme(testObject, 'london')).toBe(testObject.london);
        expect(getme(testObject, 'uk.london')).toBe(testObject.uk.london);
    });

    it('should return an object from a base object using chaining', function () {
        expect(getme(testObject)('uk')()).toBe(testObject.uk);
        expect(getme(testObject)('uk')('london')()).toBe(testObject.uk.london);
        expect(getme(testObject)('uk.london')()).toBe(testObject.uk.london);
    });

    it('should return a value from a global object when passed a string', function () {
        window.testObject = testObject;
        expect(getme('testObject.world')).toBe(testObject.world);
        expect(getme('testObject.uk.type')).toBe(testObject.uk.type);
        expect(getme('testObject.uk.london.type')).toBe(testObject.uk.london.type);
    });

    it('should return a value from a base object and string', function () {
        expect(getme(testObject, 'world')).toBe(testObject.world);
        expect(getme(testObject, 'uk.type')).toBe(testObject.uk.type);
        expect(getme(testObject, 'uk.london.type')).toBe(testObject.uk.london.type);
    });

    it('should return a value from a base object using chaining', function () {
        expect(getme(testObject)('world')()).toBe(testObject.world);
        expect(getme(testObject)('uk')('type')()).toBe(testObject.uk.type);
        expect(getme(testObject)('uk')('london')('type')()).toBe(testObject.uk.london.type);
        expect(getme(testObject)('uk.london.type')()).toBe(testObject.uk.london.type);
    });

    it('should return a function from a global object when passed a string', function () {
        window.testObject = testObject;
        expect(getme('testObject.func')).toBe(testObject.func);
        expect(getme('testObject.uk.getSize')).toBe(testObject.uk.getSize);
        expect(getme('testObject.uk.london.getSize')).toBe(testObject.uk.london.getSize);
    });

    it('should return a function from a base object and string', function () {
        expect(getme(testObject, 'func')).toBe(testObject.func);
        expect(getme(testObject, 'uk.getSize')).toBe(testObject.uk.getSize);
        expect(getme(testObject, 'uk.london.getSize')).toBe(testObject.uk.london.getSize);
    });

    it('should return a function from a base object using chaining', function () {
        expect(getme(testObject)('func')()).toBe(testObject.func);
        expect(getme(testObject)('uk')('getSize')()).toBe(testObject.uk.getSize);
        expect(getme(testObject)('uk')('london')('getSize')()).toBe(testObject.uk.london.getSize);
        expect(getme(testObject)('uk.london.getSize')()).toBe(testObject.uk.london.getSize);
    });

    it('should return a null value from a global object when passed a string', function () {
        window.testObject = testObject;
        expect(getme('testObject.nullVal')).toBeNull();
    });

    it('should return a null value from a base object and string', function () {
        expect(getme(testObject, 'nullVal')).toBeNull();
    });

    it('should return a null value from a base object using chaining', function () {
        expect(getme(testObject)('nullVal')()).toBeNull();
    });

    it('should return undefined from a global object when passed a string', function () {
        window.testObject = testObject;
        expect(getme('testObject.world.nothing')).toBeUndefined();
    });

    it('should return undefined from a base object and string', function () {
        expect(getme(testObject, 'world.nothing')).toBeUndefined();
    });

    it('should return undefined from a base object using chaining', function () {
        expect(getme(testObject)('world')('nothing')()).toBeUndefined();
        expect(getme(testObject)('world.nothing')()).toBeUndefined();
    });

    it('should return undefined from a global object when passed a string with a null value in the path', function () {
        window.testObject = testObject;
        expect(getme('testObject.nullVal.nothing')).toBeUndefined();
    });

    it('should return undefined from a base object and string with a null value in the path', function () {
        expect(getme(testObject, 'nullVal.nothing')).toBeUndefined();
    });

    it('should return undefined from a base object using chaining with a null value in the path', function () {
        expect(getme(testObject)('nullVal')('nothing')()).toBeUndefined();
        expect(getme(testObject)('nullVal.nothing')()).toBeUndefined();
    });

    it('should allow recursion of a function', function () {
        expect(getme(testObject).rec('func')()).toBe('func');
        expect(getme(testObject)('uk').rec('getSize')()).toBe(testObject.uk.area);
        expect(getme(testObject)('uk')('london').rec('getSize')()).toBe(testObject.uk.london.area);
        expect(getme(testObject)('uk.london').rec('getSize')()).toBe(testObject.uk.london.area);
        expect(getme(testObject)('uk')('london').rec('nestedFunc')()).toBe('nestedFunc');
        expect(getme(testObject)('uk.london').rec('nestedFunc')()).toBe('nestedFunc');
    });

    it('should allow arguments to be passed in to function calls when part of the path', function () {
        expect(getme(testObject)('uk')('increaseSize', ukArea)('area')()).toBe(ukArea * 2);
        expect(getme(testObject)('uk')('london')('increaseSize', londonArea)('area')()).toBe(londonArea * 2);
        resetTestObject(); // reset to ensure we know what the start value will be
        expect(getme(testObject)('uk.london')('increaseSize', londonArea)('area')()).toBe(londonArea * 2);
    });

    it('should allow arguments to be passed in recursion of function calls', function () {
        expect(getme(testObject)('uk')('london').rec('tempSize', londonArea)()).toBe(londonArea * 2);
        expect(getme(testObject)('uk.london').rec('tempSize', londonArea)()).toBe(londonArea * 2);
    });

    it('should allow running of a function', function () {
        expect(getme(testObject).run('func')()).toBe('func');
        expect(getme(testObject)('uk').run('getSize')()).toBe(testObject.uk.area);
        expect(getme(testObject)('uk')('london').run('getSize')()).toBe(testObject.uk.london.area);
        expect(getme(testObject)('uk.london').run('getSize')()).toBe(testObject.uk.london.area);
    });

    it('should allow arguments to be passed when running functions', function () {
        expect(getme(testObject)('uk').run('increaseSize', ukArea)('area')()).toBe(ukArea * 2);
        expect(getme(testObject)('uk')('london').run('increaseSize', londonArea)('area')()).toBe(londonArea * 2);
        resetTestObject(); // reset to ensure we know what the start value will be
        expect(getme(testObject)('uk.london').run('increaseSize', londonArea)('area')()).toBe(londonArea * 2);
    });
    it('should, by default, recurse functions unless they are the last value or have parameters passed', function () {
        expect(getme(testObject)('uk')('london')('getNestedMe')()).toBe(testObject.uk.london.getNestedMe);
        expect(getme(testObject)('uk.london.getNestedMe')()).toBe(testObject.uk.london.getNestedMe);
        expect(getme(testObject)('uk')('london')('getNestedMe')('area')()).toBe(londonArea);
        expect(getme(testObject)('uk.london.getNestedMe.area')()).toBe(londonArea);
    });

    it('should return the value asked for without recursion when called using val', function () {
        expect(getme(testObject)('uk').val('getSize')('defaultSize')()).toBe(ukArea);
    });

    it('should allow methods and properties on vanilla JavaScript classes to be used (if so desired)', function () {
        // strings
        expect(getme(testObject)('uk')('type')()).toBe(countryType);
        expect(getme(testObject)('uk.type')()).toBe(countryType);
        expect(getme(testObject)('uk')('type')('length')()).toBe(countryType.length);
        expect(getme(testObject)('uk.type.length')()).toBe(countryType.length);
        expect(getme(testObject)('uk')('type').run('split', '')()).toEqual(countryType.split(''));
        expect(getme(testObject)('uk.type').run('split', '')()).toEqual(countryType.split(''));

        // arrays
        expect(getme(testObject)('uk')('cityNames')('length')()).toBe(testObject.uk.cityNames.length);
        expect(getme(testObject)('uk.cityNames.length')()).toBe(testObject.uk.cityNames.length);
        expect(getme(testObject)('uk')('cityNames').run('join', ',')()).toBe(testObject.uk.cityNames.join(','));
        expect(getme(testObject)('uk.cityNames').run('join', ',')()).toBe(testObject.uk.cityNames.join(','));
        expect(getme(testObject)('uk')('cityNames')('0')()).toBe(testObject.uk.cityNames[0]);
        expect(getme(testObject)('uk.cityNames.0')()).toBe(testObject.uk.cityNames[0]);
        expect(getme(testObject)('uk')('cityNames').run('concat', ['Dublin'])()).toEqual(testObject.uk.cityNames.concat(['Dublin']));
        expect(getme(testObject)('uk.cityNames').run('concat', ['Dublin'])()).toEqual(testObject.uk.cityNames.concat(['Dublin']));

        // functions
        expect(getme(testObject)('uk').val('increaseSize')('length')()).toBe(1);

    });

    it('should not throw an error if the chain has already hit an undefined before calling run', function () {
        expect(getme(testObject)('uk')('noneExistant').run('getSize')()).toBeUndefined();
        expect(getme(testObject)('uk.noneExistant').run('getSize')()).toBeUndefined();
        expect(getme(testObject)('uk')('london')('noneExistant').run('getSize')()).toBeUndefined();
        expect(getme(testObject)('uk.london.noneExistant').run('getSize')()).toBeUndefined();
    });

    it('should not throw an error if the chain has already hit an undefined before calling val', function () {
        expect(getme(testObject)('uk')('noneExistant').val('getSize')()).toBeUndefined();
        expect(getme(testObject)('uk.noneExistant').val('getSize')()).toBeUndefined();
        expect(getme(testObject)('uk')('london')('noneExistant').val('getSize')()).toBeUndefined();
        expect(getme(testObject)('uk.london.noneExistant').val('getSize')()).toBeUndefined();
    });

    it('should not throw an error if the chain has already hit an undefined before calling rec', function () {
        expect(getme(testObject)('uk')('noneExistant').rec('getSize')()).toBeUndefined();
        expect(getme(testObject)('uk.noneExistant').rec('getSize')()).toBeUndefined();
        expect(getme(testObject)('uk')('london')('noneExistant').rec('getSize')()).toBeUndefined();
        expect(getme(testObject)('uk.london.noneExistant').rec('getSize')()).toBeUndefined();
    });

});