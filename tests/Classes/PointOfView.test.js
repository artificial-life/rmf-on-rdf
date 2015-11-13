'use strict'

var contentInit = require('./Content.init.js');

var POV = require('./PointOfView.js');
var Content = require('./Content.js');
var AtomicBasic = require('./Atomic/AtomicBasic.js');

describe('PointOfView', () => {
  var pov;

  beforeEach(() => {
    pov = new POV();
  });

  describe('#constructor', () => {
    it('is instanceof PoV', () => {
      expect(pov).to.be.an.instanceof(POV);
    });
    it('is child of Content', () => {
      expect(pov).to.be.an.instanceof(Content);
    });
  });

  describe('methods', () => {
    var content;
    beforeEach(() => {
      content = contentInit().content;
    });

    describe('#addContent', () => {
      it('regular way', () => {
        pov.addContent(content);
        for (var i = 0; i < 2; i++) {
          var path = '<namespace>content.<collection>0.some/atom/uri#' + i;
          expect(pov.content_map).to.have.deep.property(path)
            .that.is.an.instanceof(AtomicBasic);
        }
      });
    });

    describe('#length', () => {
      it('getter', () => {
        expect(pov.length).to.be.equal(0)
      });
      it('increase length', () => {
        pov.addContent(content);
        expect(pov.length).to.be.equal(1)
      });
    })

  });

});