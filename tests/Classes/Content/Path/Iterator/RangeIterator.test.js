'use strict'

var RangeIterator = require('./RangeIterator.js')

describe('RangeIterator', () => {
    var from = 1;
    var to = 10;
    var iterator = new RangeIterator(from, to);

    it('#constructor', () => {
        expect(iterator).to.be.an.instanceof(RangeIterator);
    });

    it('#next', () => {
        for (var i = from; i <= to; i++) {
            var next = iterator.next();
            expect(next).to.have.property('done', false);
            expect(next).to.have.property('value')
                .and.deep.equal(i);
        }
    });
});