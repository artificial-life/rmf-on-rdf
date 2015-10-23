'use strict'

var ZeroDimensional = require('./ZeroDimensionalVolume.js');
var Plan = require('./Plan.js');
var PrimitiveVolume = require('./Primitive/PrimitiveVolume.js');

describe('ZeroDimensional', () => {
    var volume;
    beforeEach(function () {
        volume = new ZeroDimensional();
    });
    it('constructor', () => {
        volume.build({
            state: 'a'
        });
        expect(volume.getContent()).to.not.be.empty;
    });
    it('secondary extension must fail', () => {
        volume.build({
            state: 'a'
        });
        expect(volume.extendPrimitive.bind(volume, {
            state: 'a'
        })).to.throw(Error);

    });
    it('upscale', () => {
        var plan = new Plan();
        plan.build([{
            data: [[0, 100]],
            state: 'a'
            }, {
            data: [[200, 400]],
            state: 'a'
            }]);

        volume.build({
            state: 'a'
        });

        expect(volume.upscale(plan)).to.not.throw(Error);
    });

    it('intersection', () => {
        var second = new ZeroDimensional();
        second.build({
            state: 'a'
        });

        var result = volume.intersection(second);

        expect(result.getContent()).to.be.empty;
        volume.build({
            state: 'a'
        });
        result = volume.intersection(second);

        expect(result.getContent()).to.not.be.empty;
        expect(result.getContent()).to.have.property('state')
            .with.deep.property('mark', 'a');
    });

    it('intersection with upscale', () => {
        var second = new Plan();
        second.build([{
            data: [[0, 100]],
            state: 'a'
            }, {
            data: [[200, 400]],
            state: 'a'
            }]);

        var result = volume.intersection(second);

        expect(result.getContent()).to.be.empty;

        volume.build({
            state: 'a'
        });

        result = volume.intersection(second);

        expect(result).to.be.an.instanceof(Plan);
        expect(result.getContent()).to.have.length(2);

    });

    it('put', () => {
        var item = new PrimitiveVolume([], 'r');
        volume.build({
            state: 'a'
        });

        volume.put(item);

        expect(result.getContent()).to.have.property('state')
            .with.deep.property('mark', 'r');
    });

});