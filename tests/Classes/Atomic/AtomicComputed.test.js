'use strict'

var AtomicComputed = require('./AtomicComputed.js');
var AtomicBasic = require('./AtomicBasic.js');
var BasicAccessor = require('./Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');
var Plan = require('./BaseTypes/Plan.js');
var AtomicFactory = require('./AtomicFactory.js');

describe('AtomicComputed', () => {
  var source;
  var computed;
  var provider;
  var accessor;
  var context;

  beforeEach(() => {
    context = [
      [0, 400]
    ];

    TEST_STORAGE.test_plan_data = [{
      data: [
        [0, 100]
      ],
      state: 'a'
    }, {
      data: [
        [200, 400]
      ],
      state: 'a'
    }];

    provider = new HashmapDataProvider();
    accessor = new BasicAccessor(provider);

    accessor.keymaker('set', 'test_plan_data');
    accessor.keymaker('get', 'test_plan_data');

    source = new AtomicBasic(Plan, accessor);
    computed = new AtomicComputed(source);
  });

  describe('#constructor', () => {
    it('throws error without args', () => {
      var fn = () => {
        return new AtomicComputed()
      };
      expect(fn).to.throw(Error);
    });

    it('normal way', () => {
      expect(computed).to.be.an.instanceof(AtomicComputed);
    });
  });

  describe('methods', () => {
    describe('#source_atom getter', () => {
      it('is reference of source atom', () => {
        expect(computed.source_atom).to.be.deep.equal(source)
      })
    });

    describe('#addAtom', () => {
      it('regular way', () => {
        var provider = new HashmapDataProvider();
        var basic_accessor = new BasicAccessor(provider);

        var basic = AtomicFactory.create('Basic', {
          type: 'Plan',
          accessor: basic_accessor
        });

        computed.addAtom(basic);

        expect(computed.content).to.have.length(2);
        expect(computed.content).to.have.deep.property('[1]', basic);
      });
    });

    describe('#save', () => {
      it('#save calls source_atom #save', () => {
        var data = new Plan();

        var raw_data = [{
          data: [
            [0, 100]
          ],
          state: 'a'
        }, {
          data: [
            [200, 400]
          ],
          state: 'r'
        }];

        data.build(raw_data);

        computed.save(data);

        expect(TEST_STORAGE).to.have.property('test_plan_data')
          .that.is.an('array')
          .with.deep.property('[1]')
          .that.deep.equals({
            data: [
              [200, 400]
            ],
            state: 'r'
          });
      });
    });

    describe('#resolve', () => {
      it('simple #resolve equal source #resolve', () => {
        var result = computed.resolve();

        expect(result).to.be.an.instanceof(Plan);
        expect(result.serialize()).to.deep.equal(TEST_STORAGE.test_plan_data);
      });
      it('#resolve with containers', () => {
        var provider = new HashmapDataProvider();
        var basic_accessor = new BasicAccessor(provider);

        basic_accessor.keymaker('get', 'test_container_data');

        TEST_STORAGE.test_container_data = [{
          data: [
            [50, 100]
          ],
          state: 'a'
        }, {
          data: [
            [300, 600]
          ],
          state: 'a'
        }];

        var basic = AtomicFactory.create('Basic', {
          type: 'Plan',
          accessor: basic_accessor
        });

        computed.addAtom(basic);

        var result = computed.resolve();

        expect(result).to.be.an.instanceof(Plan);
        expect(result.serialize()).to.deep.equal([{
          data: [
            [50, 100]
          ],
          state: 'a'
        }, {
          data: [
            [300, 400]
          ],
          state: 'a'
        }]);

      })
    });

  });
})