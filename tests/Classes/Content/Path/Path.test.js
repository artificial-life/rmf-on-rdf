'use strict'

var Path = require('./Path.js');

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

var Selector = require('./Selector.js');
var BasicIterator = require('./Iterator/BasicIterator.js');
describe('Path', () => {
    var path;

    beforeEach(() => {
        path = new Path(test_map);
    });

    it('#constructor', () => {
        expect(path).to.be.instanceof(Path);
        expect(path).to.have.property('path_selector');
        expect(path).to.have.property('collection');
    });

    describe('methods', () => {

        describe('#chain getter', () => {
            it('chain is an array', () => {
                expect(path.chain).to.be.an('array');
            });
        });

        describe('#makeInitial', () => {
            it('returns key array', () => {
                path.selector().reset().id('services').all();
                var keys = path.makeInitial();

                expect(keys).to.be.deep.equal(['services', undefined]);
            });
        });

        describe('#selector', () => {
            it('returns Selector object', () => {
                expect(path.selector()).to.be.an.instanceof(Selector);
            });

            it('build selector', () => {
                path.selector().reset().id('services').all();

                expect(path.chain).to.have.length(2);

                _.forEach(path.chain, (iterator) => {
                    expect(iterator).to.be.an.instanceof(BasicIterator);
                });
            });
        });

        describe('#next', () => {

            it('getting next (pattern : "objects / *")', () => {
                path.selector().reset().id('objects').all();
                var next;

                for (var i = 0; i < 3; i += 1) {
                    next = path.next();

                    expect(next).to.have.property('done', false);
                    expect(next).to.have.property('value')
                        .and.deep.equal(['objects', 'o/uri' + (i + 1)]);
                }
            });

            it('getting next (pattern : "elephants / big / [big/uri1,big/uri2]")', () => {
                path.selector().reset().id('elephants').id('big').list(['big/uri1', 'big/uri2']);
                var next;

                for (var i = 0; i < 2; i += 1) {
                    next = path.next();

                    expect(next).to.have.property('done', false);
                    expect(next).to.have.property('value')
                        .and.deep.equal(['elephants', 'big', 'big/uri' + (i + 1)]);
                }
            });
        });

        describe('#Symbol.iterator', () => {
            it('iterate in "for..of"', () => {
                path.selector().reset().id('objects').all();
                var counter = 1;

                for (var p of path) {
                    expect(p).deep.equal(['objects', 'o/uri' + counter++]);
                }
            })
        });


    });
});