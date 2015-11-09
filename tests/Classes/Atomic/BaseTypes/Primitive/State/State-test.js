'use strict'

var State = require(_base + '/build/Classes/Content/BaseTypes/Primitive/State/State.js');

describe('State', function () {

    it('had "a" mark', function () {
        var state = new State('a');
        expect(state).to.have.property('mark', 'a')
    });
});