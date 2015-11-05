'use strict'

var AllIterator = require('./AllIterator.js');

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
        },
        'pink': {
            'pink/uri1': 1
        }
    }
};

var iterator = new AllIterator(test_map, ['services']);

describe('AllIterator', () => {
    it('#constructor', () => {
        expect(iterator).to.be.an.instanceof(AllIterator);
    });
    it('#next', () => {
        for (var i = 0; i < 3; i++) {
            var next = iterator.next();
            expect(next).to.have.property('done', false);
            expect(next).to.have.property('value')
                .and.deep.equal('service/uri' + (i + 1));
        }
    });
});