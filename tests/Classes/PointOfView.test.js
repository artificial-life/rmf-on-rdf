'use strict'

var POV = require('./PointOfView.js');
var Condition = require('./Condition.js');
var Content = require('./Content/Content.js');

describe('PointOfView', () => {
    var pov;
    beforeEach(() => {
        var container1 = new Condition();
        var container2 = new Condition();
        var resource_source = new Condition();
        resource_source.getContent().setConsumable(true);

        pov = new POV([container1, container2, resource_source]);
    });

    it('constructor', () => {
        expect(pov.content).to.be.an.instanceof(Content);
    });

    it('observe', () => {
        var observed = pov.observe({
            time: {
                strat: 1,
                end: 22
            }
        });

        expect(observed).to.be.an.instanceof(POV);
        expect(observed.content).to.be.an.instanceof(Content);
        //@TODO: check content parts
    });

    it('reserve', () => {
        var reserved = pov.reserve({
            time: {
                strat: 1,
                end: 22
            }
        });

        expect(reserved).to.be.an.instanceof(POV);
        expect(reserved.content).to.be.an.instanceof(Content);
        //@TODO: check content parts
        //@TODO: check content state. it must be "r"
    });

});