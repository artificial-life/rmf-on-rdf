'use strict'

var BasicAccessor = require('./BasicAccessor.js');

var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

describe('BasicAccessor', () => {
    var accessor;
    var provider;
    beforeEach(() => {
        provider = new HashmapDataProvider();
        accessor = new BasicAccessor(provider);
    });

    describe('#constructor', () => {
        it('object created', () => {
            expect(accessor).to.be.an.instanceof(BasicAccessor);
        });

        it('provider binded', () => {
            expect(accessor).to.have.property('data_provider').that.is.an('object');
        });
    });
    describe('methods', () => {
        describe('#keymaker', () => {
            it('make setter and getter function', () => {
                accessor.keymaker('set', (x) => {
                    return x
                });

                accessor.keymaker('get', (x) => {
                    return x
                });
                expect(accessor).to.have.deep.property('makers.set');
                expect(accessor).to.have.deep.property('makers.get');
            });
            it('make setter and getter constant', () => {
                accessor.keymaker('set', 1);

                accessor.keymaker('get', 2);
                expect(accessor).to.have.deep.property('makers.set', 1);
                expect(accessor).to.have.deep.property('makers.get', 2);
            });
        });

        describe('#makeAccessObject', () => {
            it('makeAccessObject from function', () => {
                accessor.keymaker('set', (x) => {
                    return x
                });

                for (var i = 0; i < 5; i++) {
                    var obj = accessor.makeAccessObject('set', i);
                    expect(obj).to.equal(i);
                }
            });

            it('makeAccessObject from string', () => {
                accessor.keymaker('set', '2');

                for (var i = 0; i < 5; i++) {
                    var obj = accessor.makeAccessObject('set', i);
                    expect(obj).to.equal('2');
                }
            });

            it('throws Error on nonexistent', () => {
                expect(accessor.makeAccessObject.bind(accessor, 'set', 2)).to.throw(Error);
            });
        });

        describe('#get', () => {
            it('get existent', () => {
                TEST_STORAGE.foo = 'bar';

                accessor.keymaker('get', (x) => {
                    return x;
                });
                var result = accessor.get('foo');
                expect(result).to.equal('bar');
            });

            it('throws Error on nonexistent', () => {
                accessor.keymaker('get', (x) => {
                    return x;
                });

                expect(accessor.get.bind(accessor, 'foofoo')).to.throw(Error);
            });
        });

        describe('#set', () => {
            beforeEach(() => {
                TEST_STORAGE.foo = 'bar';
            });

            it('set existent', () => {
                accessor.keymaker('set', 'foo');

                var result = accessor.set('baz');
                expect(result).to.be.ok;
                expect(TEST_STORAGE.foo).to.equal('baz');
            });

            it('throws Error on nonexistent', () => {
                accessor.keymaker('set', 'foofoo');

                expect(accessor.set.bind(accessor, 1)).to.throw(Error);
            });
        });

        describe('#upsert', () => {
            beforeEach(() => {
                TEST_STORAGE.foo = 'bar';
            });

            it('upsert existent', () => {
                accessor.keymaker('upsert', 'foobazbar');

                var result = accessor.upsert('baz');
                expect(result).to.be.ok;

                expect(TEST_STORAGE.foobazbar).to.equal('baz');
            });

            it('upsert on nonexistent', () => {
                accessor.keymaker('upsert', 'foobazbar');

                var result = accessor.upsert('bah');

                expect(result).to.be.ok;
                expect(TEST_STORAGE.foobazbar).to.equal('bah');
            });

            it('upsert thru only "set" keymaker', () => {
                accessor.keymaker('set', 'foobazbar');
                expect(accessor).to.not.have.deep.property('makers.upsert');
                var result = accessor.upsert('bag');

                expect(result).to.be.ok;
                expect(TEST_STORAGE.foobazbar).to.equal('bag');
            });
        });

    });
})