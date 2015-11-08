'use strict'

var Path = require('./Path.js');
var AtomicBasic = require('../AtomicBasic.js');
var atom = new AtomicBasic();

var test_map = {
  'services': {
    'service/uri1': atom,
    'service/uri2': atom,
    'service/uri3': atom
  },
  'objects': {
    'o/uri1': atom,
    'o/uri2': atom,
    'o/uri3': atom
  },
  'elephants': {
    'big': {
      'big/uri1': atom,
      'big/uri2': atom,
      'big/uri3': atom
    },
    'small': {
      'small/uri1': atom,
      'small/uri2': atom,
      'small/uri3': atom
    },
    'pink': {
      'pink/uri1': atom
    }
  }
};

var Selector = require('./ObjectSelector.js');
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
            .and.deep.equal(atom);
        }
      });

      it('getting next (pattern : "elephants / big / [big/uri1,big/uri2]")', () => {
        path.selector().reset().id('elephants').id('big').list(['big/uri1', 'big/uri2']);
        var next;

        for (var i = 0; i < 2; i += 1) {
          next = path.next();

          expect(next).to.have.property('done', false);
          expect(next).to.have.property('value')
            .and.deep.equal(atom);
        }
      });
    });

    describe('#Symbol.iterator', () => {
      it('iterate in "for..of"', () => {
        path.selector().reset().id('objects').all();
        var count = 0;
        for (var p of path) {
          count++;
          expect(p).deep.equal(atom);
        }
        expect(count).to.be.equal(3);
      });

      it('traverse all tree when no selector', () => {
        path.selector().reset();

        var count = 0;
        for (var p of path) {
          count++;
          expect(p).deep.equal(atom);
        }

        expect(count).to.be.equal(13);
      });
    });


  });
});