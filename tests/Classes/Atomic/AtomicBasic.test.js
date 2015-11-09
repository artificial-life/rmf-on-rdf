'use strict'

var AtomicContent = require('./AtomicBasic.js');
var Plan = require('./BaseTypes/Plan.js');
var BasicAccessor = require('./Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

describe('Atomic Basic', () => {
    var atomic;
    var provider;
    var accessor;
    var context;

    beforeEach(() => {
        context = [[0, 400]];

        TEST_STORAGE.test_plan_data = [{
            data: [[0, 100]],
            state: 'a'
            }, {
            data: [[200, 400]],
            state: 'a'
            }];

        provider = new HashmapDataProvider();
        accessor = new BasicAccessor(provider);

        accessor.keymaker('set', 'test_plan_data');
        accessor.keymaker('get', 'test_plan_data');

        atomic = new AtomicContent(Plan, accessor);
    });

    it('#constructor', () => {
        expect(atomic).to.be.an.instanceof(AtomicContent);
    });
    describe('methods', () => {
        describe('#resolve', () => {
            it('resolve constant', () => {
                var resolved = atomic.resolve(context);

                expect(resolved).to.be.an.instanceof(Plan);
                expect(resolved.getContent()).to.have.length(2);
            });
        });
        describe('#save', () => {
            it('save AbstractVolume instance', () => {
                var data = new Plan();

                var raw_data = [{
                    data: [[0, 100]],
                    state: 'a'
                }, {
                    data: [[200, 400]],
                    state: 'r'
                }];

                data.build(raw_data);

                atomic.save(data);

                expect(TEST_STORAGE).to.have.property('test_plan_data')
                    .that.is.an('array')
                    .with.deep.property('[1]')
                    .that.deep.equals({
                        data: [[200, 400]],
                        state: 'r'
                    });
            });

            it('save raw data', () => {
                var raw_data = [{
                    data: [[0, 100]],
                    state: 'a'
                }, {
                    data: [[200, 400]],
                    state: 'r'
                }];

                atomic.save(raw_data);

                expect(TEST_STORAGE).to.have.property('test_plan_data')
                    .that.is.an('array')
                    .with.deep.property('[1]')
                    .that.deep.equals({
                        data: [[200, 400]],
                        state: 'r'
                    });
            });
        });
    })
});