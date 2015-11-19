'use strict'

var ResolvedContent = require('./ResolvedContent.js');
var Plan = require('./Atomic/BaseTypes/Plan.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

var contentInit = require('./Content.init.js');

describe('ResolvedContent', () => {
  var resolved_content;
  var content;
  beforeEach(() => {
    var init = contentInit();
    content = init.content;
    resolved_content = content.resolve();
  });

  describe('#constructor', () => {
    it('constructor without parent content throws error', () => {
      var fn = function() {
        new ResolvedContent()
      };
      expect(fn).to.throw(Error);
    });

    it('normal way', () => {
      var test = new ResolvedContent(content);
      expect(test).to.be.an.instanceof(ResolvedContent);
    });
  });

  describe('methods', () => {

    it('#save', () => {
      var atom = resolved_content.getAtom(['<namespace>content', 'some/atom/uri#0']);
      atom.content[0].start = 99;

      var result = resolved_content.save();
      expect(TEST_STORAGE.test_plan_data1[0].data).to.be.deep.equal([
        [99, 100]
      ]);
      expect(result).to.be.deep.equal([true, true]);
    });

    it('#getAtom', () => {
      var atom = resolved_content.getAtom(['<namespace>content', 'some/atom/uri#0']);
      expect(atom).to.be.an.instanceof(Plan);
    });
    it('#observe');
  });

})