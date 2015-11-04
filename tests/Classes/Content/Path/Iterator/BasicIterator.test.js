'use strict'

var BasicIterator = require('./BasicIterator.js');

var test_map = {
    'services': {
        'service/uri1': 1,
        'service/uri2': 2,
        'service/uri3': 3
    },
    'objects': {
        'o/uri1': 1,
        'o/uri2': 2,
        'o/uri3': 3
    },
    'elephants': {
        'big': {
            'big/uri1': 1,
            'big/uri2': 2,
            'big/uri3': 3
        },
        'small': {
            'small/uri1': 1,
            'small/uri2': 2,
            'small/uri3': 3
        }
    }
};

describe('BasicIterator', () => {

    var iterator;

    beforeEach(() => {
        iterator = new BasicIterator(test_map);
    });

    it('#constructor', () => {
        expect(iterator).to.be.an.instanceof(BasicIterator)
    });
    describe('methods', () => {
        it('#path', () => {
            var selector = 'services|*|*';
            iterator.path(selector);
        });
    });
})