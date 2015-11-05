'use strict';

var Selector = require('./Selector.js');

var AllIterator = require('./Iterator/AllIterator.js');
var IdIterator = require('./Iterator/IdIterator.js');
var ArrayIterator = require('./Iterator/ArrayIterator.js');
var RangeIterator = require('./Iterator/RangeIterator.js');

describe('Selector', () => {
    var selector;

    beforeEach(() => {
        selector = new Selector();
    });

    it('#constructor', () => {
        expect(selector).to.be.instanceof(Selector);
    });

    describe('methods', () => {

        it('#all', () => {
            selector.all();
            expect(selector).to.have.deep.property('chain[0]')
                .that.is.an.instanceof(AllIterator);
        });
        it('#list', () => {
            selector.list([]);

            expect(selector).to.have.deep.property('chain[0]')
                .that.is.an.instanceof(ArrayIterator);
        });

        it('#id', () => {
            selector.id('nothing');
            expect(selector).to.have.deep.property('chain[0]')
                .that.is.an.instanceof(IdIterator);
        });

        it('#range', () => {
            selector.range(1, 10);
            expect(selector).to.have.deep.property('chain[0]')
                .that.is.an.instanceof(RangeIterator);
        });

        it('#reset', () => {
            selector.id('nothing');
            selector.reset();
            expect(selector).to.have.deep.property('chain')
                .that.have.length(0);
        });

        it('#getChain', () => {
            selector.range(1, 10);
            var chain = selector.getChain();

            expect(chain).to.be.an('array')
                .that.have.length(1);
        });
    });
});