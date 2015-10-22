var Plan = require('../Classes/Content/BaseTypes/Plan.js');
var TimeChunk = require('../Classes/Content/BaseTypes/Primitive/TimeChunk.js');
var State = require('../Classes/Content/BaseTypes/Primitive/State/State.js');

describe('Basic', function () {



    describe('Volume', function () {
        var volume;
        beforeEach(function () {
            volume = new Plan();

            volume.build([{
                data: [[0, 100]],
                state: 'a'
            }, {
                data: [[200, 400]],
                state: 'a'
            }]);

        });

        it('build Plan', function () {
            expect(volume.getContent()).to.have.length(2);
        });
        it('solid intersection', function () {
            var chunk = new TimeChunk(
              [[50, 300]],
                'a'
            );

            var solid = volume.intersection(chunk, true);
            var notsolid = volume.intersection(chunk);
            expect(solid.getContent()).to.not.deep.equal(notsolid.getContent());
            expect(solid.getContent()).to.have.deep.property('[0].start', 0);
            expect(solid.getContent()).to.have.deep.property('[0].end', 100);
        });

        it('put primitive volume into Plan', function () {
            var result = volume.put({
                data: [[50, 70]],
                state: 'r'
            });
            expect(result).to.be.ok;
            expect(result.getContent()).to.have.length(4);

        });

        it('put - panic strategy / conflict strategy', function () {
            throw new Error('Not done yeat')

        });

        it('check consistency', function () {
            throw new Error('Not done yeat')
        });


        it('commit Plan changes', () => {
            var result = volume.put({
                data: [[50, 70]],
                state: 'r'
            });
            var status = result.save();

            expect(status).to.be.ok;
            expect(volume.getContent()).to.have.length(4);
        });

        it('decline Plan changes due conflict', () => {
            var passing = volume.put({
                data: [[50, 70]],
                state: 'r'
            });

            var conflict = volume.put({
                data: [[20, 90]],
                state: 'r'
            });

            var status_passing = passing.save();
            var status_conflict = conflict.save();

            expect(status_passing).to.be.ok;
            expect(status_conflict).to.be.an.instanceof(Error);

            expect(volume.getContent()).to.have.length(4);
        });
    });
});