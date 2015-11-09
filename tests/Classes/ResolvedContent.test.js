'use strict'

var ResolvedContent = require('./ResolvedContent.js');

describe('ResolvedContent (DRAFT)', () => {
  var resolved_content;
  beforeEach(() => {
    resolved_content = new ResolvedContent();
  });

  describe('methods', () => {
    it('#constructor', () => {
      expect(resolved_content).to.be.an.instanceof(ResolvedContent);
    });
    it('#save');
  });

})