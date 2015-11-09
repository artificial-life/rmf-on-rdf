'use strict'

var BasicIterator = require('./BasicIterator.js');

describe('BasicIterator', () => {

    var iterator;

    beforeEach(() => {
        iterator = new BasicIterator();
    });

    it('#constructor', () => {
        expect(iterator).to.be.an.instanceof(BasicIterator)
    });
});