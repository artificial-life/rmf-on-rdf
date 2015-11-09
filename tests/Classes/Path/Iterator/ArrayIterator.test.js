'use strict'

var ArrayIterator = require('./ArrayIterator.js')

describe('ArrayIterator', () => {

    var data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var iterator = new ArrayIterator(data);

    it('#constructor', () => {
        expect(iterator).to.be.an.instanceof(ArrayIterator);
    });
    it('#next', () => {
        for (var i = 0; i < data.length; i++) {
            var next = iterator.next();
            expect(next).to.have.property('done', false);
            expect(next).to.have.property('value')
                .and.deep.equal(data[i]);
        }
    });
});