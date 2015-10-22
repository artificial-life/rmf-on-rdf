'use strict'

var Strategy = require(_base + '/build/Classes/Content/BaseTypes/PlacingStrategy/Strategy.js');
var Common = require(_base + '/build/Classes/Content/BaseTypes/PlacingStrategy/Common.js');
var State = require(_base + '/build/Classes/Content/BaseTypes/Primitive/State/State.js');
var TimeChunk = require(_base + '/build/Classes/Content/BaseTypes/Primitive/TimeChunk.js');

describe('Strategy', function () {

    var strategy;

    beforeEach(() => {
        strategy = new Strategy();
    });
    it('constructor', function () {
        var str1 = new Strategy();
        str1.all(() => {
            return 7;
        });

        var str2 = new Strategy(str1);
        str2.except('a=>b', 1);

        expect(str1.actions).to.not.equal(str2.actions);
        expect(str1).to.not.have.deep.property('actions.a=>b');
        expect(str2).to.have.deep.property('actions.a=>b');
    });

    it('"all" method', function () {
        strategy.all(() => {
            return new Error('Test');
        });

        expect(strategy).to.have.property('actions')
            .with.deep.property('*=>*')
            .that.is.an.instanceof(Function);
    });

    it('"getStrategy" method', function () {
        var pair_syntax = strategy.getStrategy('a', 'b');

        expect(pair_syntax).to.not.be.ok;

        strategy.all(() => {
            return new Error('Test');
        });

        pair_syntax = strategy.getStrategy('a', 'b');
        var string_syntax = strategy.getStrategy('a=>b');

        var newbee = new State('a');
        var oldone = new State('b');
        var state_syntax = strategy.getStrategy(newbee, oldone);

        expect(pair_syntax).to.be.ok;
        expect(pair_syntax()).to.be.an.instanceof(Error);
        expect(pair_syntax).to.equal(string_syntax).and.equal(state_syntax);
    });

    it('"all"+"except" method', function () {
        strategy.all(() => {
                return new Error('Test');
            })
            .except('a=>b', (a, b) => a + b)
            .except('a', 'z', (a, z) => a - z);


        var avsb = strategy.getStrategy('a', 'b');
        var avsz = strategy.getStrategy('a', 'z');

        expect(avsb).to.be.ok.and.be.an.instanceof(Function);
        expect(avsz).to.be.ok.and.be.an.instanceof(Function);

        expect(avsb(1, 2)).to.equal(3);
        expect(avsz(10, 3)).to.equal(7);
    });
});