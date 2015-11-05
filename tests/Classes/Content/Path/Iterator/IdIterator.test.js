'use strict'

var IdIterator = require('./IdIterator.js');

describe('IdIterator', () => {
    var iterator;
    beforeEach(() => {
        iterator = new IdIterator('ID');
    });

    it('#constructor', () => {
        expect(iterator).to.be.an.instanceof(IdIterator);
    });

    describe('methods', () => {
        describe('#next', () => {
            it('one #next', () => {
                var result = iterator.next();

                expect(result).to.have.property('done', false);
                expect(result).to.have.property('value', 'ID');
            });
            it('two #next', () => {
                var result = iterator.next();

                expect(result).to.have.property('done', false);
                expect(result).to.have.property('value', 'ID');

                result = iterator.next();

                expect(result).to.have.property('done', true);
                expect(result).to.have.property('value').and.not.ok;
            });
        });


    });
});