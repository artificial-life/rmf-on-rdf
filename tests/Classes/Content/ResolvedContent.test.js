'use strict'
var ResolvedContent = require('./ResolvedContent.js');
console.log(ResolvedContent);
describe('ResolvedContent (DRAFT)', () => {
    var resolved_content;
    beforeEach(() => {
        resolved_content = new ResolvedContent();
    });
    it('#constructor', () => {
        expect(resolved_content).to.be.an.instanceof(ResolvedContent);
    });
})