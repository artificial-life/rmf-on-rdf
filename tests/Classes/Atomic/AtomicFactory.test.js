'use strict'

var AtomicFactory = require('./AtomicFactory.js');
var BasicAccessor = require('./Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicBasic = require('./AtomicBasic.js');

describe('AtomicFactory', () => {

    it('#constructor throws Error', () => {
        expect(AtomicFactory).to.throw(Error)
    });

    describe('static methods', () => {
        describe('#create', () => {
            it('regular way', () => {
                var provider = new HashmapDataProvider();
                var basic_accessor = new BasicAccessor(provider);

                var result = AtomicFactory.create('Basic', {
                    type: 'Plan',
                    accessor: basic_accessor
                });

                expect(result).to.be.an.instanceof(AtomicBasic);
            });
        });
    });
});