'use strict'

var Strategy = require(_base + '/build/Classes/Content/BaseTypes/PlacingStrategy/Strategy.js');
var Common = require(_base + '/build/Classes/Content/BaseTypes/PlacingStrategy/Common.js');
var State = require(_base + '/build/Classes/Content/BaseTypes/Primitive/State/State.js');
var TimeChunk = require(_base + '/build/Classes/Content/BaseTypes/Primitive/TimeChunk.js');

describe('Common Strategy', function () {
    var newbee;
    var oldone;

    beforeEach(() => {
        newbee = new TimeChunk([[50, 70]]);
        oldone = new TimeChunk([[0, 100]]);
    });

    it('strategy for Reserved', function () {
        var RvsA = Common.getStrategy('r', 'a');
        var RvsR = Common.getStrategy('r', 'r');
        var RvsNA = Common.getStrategy('r', 'na');

        expect(RvsA).to.be.an.instanceof(Function);
        var success = RvsA(newbee, oldone);

        expect(success).to.be.an.instanceof(Array);
        expect(success).to.have.length(2);
        expect(success).to.have.deep.property('[0].start', 0);
        expect(success).to.have.deep.property('[0].end', 50);
        expect(success).to.have.deep.property('[1].start', 70);
        expect(success).to.have.deep.property('[1].end', 100);

        expect(RvsR).to.be.an.instanceof(Function);
        expect(RvsR(newbee, oldone)).to.be.an.instanceof(Error);

        expect(RvsNA).to.be.an.instanceof(Function);
        expect(RvsNA(newbee, oldone)).to.be.an.instanceof(Error);

    });

    it('strategy for Available', function () {
        var AvsA = Common.getStrategy('a', 'a');
        var AvsR = Common.getStrategy('a', 'r');
        var AvsNA = Common.getStrategy('a', 'na');

        expect(AvsA(newbee, oldone)).to.be.an.instanceof(Error);
        expect(AvsR(newbee, oldone)).to.be.an.instanceof(Error);
        expect(AvsNA(newbee, oldone)).to.be.an.instanceof(Error);
    });

    it('strategy for Not Available', function () {
        var NAvsA = Common.getStrategy('na', 'a');
        var NAvsR = Common.getStrategy('na', 'r');
        var NAvsNA = Common.getStrategy('na', 'na');

        expect(NAvsA(newbee, oldone)).to.be.an.instanceof(Error);
        expect(NAvsR(newbee, oldone)).to.be.an.instanceof(Error);
        expect(NAvsNA(newbee, oldone)).to.be.an.instanceof(Error);
    });

    it('custom strategy based on Common', function () {
        var Custom = new Strategy(Common);
        var inherited = Custom.getStrategy('r', 'a');

        expect(inherited).to.be.an.instanceof(Function);
        Custom.except('q', 'z', () => {
            return 'test'
        });
        var not_exist = Common.getStrategy('q', 'z');

        expect(not_exist(newbee, oldone)).to.be.an.instanceof(Error);

        var exist = Custom.getStrategy('q', 'z');

        expect(exist(newbee, oldone)).to.equal('test');
    });
});