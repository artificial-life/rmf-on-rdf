'use strict'

var HashmapDataProvider = require('./HashmapDataProvider.js');
var TEST_STORAGE = require('./TESTSTORAGE.js');

TEST_STORAGE['foo'] = 'bar';

describe('HashmapDataProvider', () => {
    var hash;
    beforeEach(() => {
        hash = new HashmapDataProvider();
    });

    it('#constructor', () => {
        expect(hash).to.be.an.instanceof(HashmapDataProvider);
    });

    describe('methods', () => {
        describe('#get', () => {
            it('get exsistent', () => {
                var result = hash.get('foo');
                expect(result).to.equal('bar');
            });
            it('nonexistent - throws Error', () => {
                expect(hash.get.bind(hash, 'foobar')).to.throw(Error);
            });
        });

        describe('#set', () => {
            it('set exsistent', () => {
                var result = hash.set('foo', 'baz');
                expect(result).to.be.ok;

                result = hash.get('foo');
                expect(result).to.equal('baz');
            });
            it('nonexistent - throws Error', () => {
                expect(hash.set.bind(hash, 'foobar')).to.throw(Error);
            });
        });

        describe('#upsert', () => {
            it('upsert anything', () => {
                var result = hash.upsert('bar', 'baz');
                expect(result).to.be.ok;

                result = hash.get('bar');
                expect(result).to.equal('baz');
            });

        });
    });
});