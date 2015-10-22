'use strict'

var AtomicContent = require('./AtomicContent.js');
var Plan = require('./BaseTypes/Plan.js');
describe('Atomic Content', () => {
    var query_params = {
        time: [0, 100]
    };
    it('resolve - static data', () => {
        var content = new AtomicContent({
            type: 'Plan',
            data: [{
                data: [[0, 100]],
                state: 'a'
            }, {
                data: [[200, 400]],
                state: 'a'
            }]
        });


        var result = content.resolve(query_params);
        expect(result).to.be.an.instanceof(Plan);
        expect(result.getContent()).to.have.length(2);
    });

    it('resolve - functional data', () => {
        var content = new AtomicContent({
            type: 'Plan',
            data: (params) => {
                return [{
                    data: [[0, 150]],
                    state: 'a'
            }, {
                    data: [[200, 300]],
                    state: 'a'
            }];
            }
        });


        var result = content.resolve(query_params);

        expect(result).to.be.an.instanceof(Plan);
        expect(result.getContent()).to.have.length(2);
    });
});