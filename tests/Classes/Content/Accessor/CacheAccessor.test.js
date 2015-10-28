'use strict'

var CacheAccessor = require('./CacheAccessor.js');

var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');


describe('CacheAccessor', () => {
    var cache_accessor;

    var provider;
    beforeEach(() => {
        provider = new HashmapDataProvider();
        cache_accessor = new CacheAccessor(provider);
    });

    it('#constructor', () => {
        expect(cache_accessor).to.be.an.instanceof(CacheAccessor)
    });
    describe('methods', () => {

        describe('#template', () => {
            it('define', () => {
                cache_accessor.template((x) => {
                    return x;
                });

                expect(cache_accessor).to.have.property('template').and.an.instanceof(Function);
            });
        });
        describe('#makeInitial', () => {
            it('thorws Error when template undefined', () => {
                expect(cache_accessor.makeInitial.bind(cache_accessor, 1)).to.throw(Error);
            });
            it('returns template data when template method deifned', () => {
                cache_accessor.template((x) => {
                    return x;
                });
                for (var i = 0; i < 5; i++) {
                    var data = cache_accessor.makeInitial(i);
                    expect(data).to.equal(i);
                }
            });
        });
        describe('#get', () => {
            it('gets template data on undefined key', () => {
                cache_accessor.keymaker('get', (x) => x);
                cache_accessor.template((x) => {
                    return 'foo-foo';
                });

                var result = cache_accessor.get('foobar');
                expect(result).to.equal('foo-foo');
            });

            it('normal behavior', () => {
                cache_accessor.keymaker('get', (x) => x);

                var result = cache_accessor.get('foo');
                expect(result).to.equal('bar');
            });
        });
    })
});