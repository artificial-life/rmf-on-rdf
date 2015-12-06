'use strict'

var AtomicFactory = require('./AtomicFactory.js');
var BasicAccessor = require('./Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicBasic = require('./AtomicBasic.js');
var BaseCollection = require('./BaseTypes/BaseCollection.js');

describe.only('AtomicFactory', () => {

  it('#constructor throws Error', () => {
    var test = function() {
      return new AtomicFactory();
    }
    expect(test).to.throw(Error)
  });

  describe('static methods', () => {
    describe('#create', () => {
      it('regular way', () => {
        var provider = new HashmapDataProvider();
        var basic_accessor = new BasicAccessor(provider);

        var result = AtomicFactory.create('Basic', {
          type: 'Plan',
          accessor: basic_accessor
        });

        expect(result).to.be.an.instanceof(AtomicBasic);
      });

      it('compound', () => {
        var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

        TEST_STORAGE.test_collection_data = {
          '1x1c': [{
            data: [
              [0, 100]
            ],
            state: 'a'
          }, {
            data: [
              [200, 400]
            ],
            state: 'r'
          }],
          '1z1x': [{
            data: [
              [0, 10]
            ],
            state: 'a'
          }, {
            data: [
              [20, 40]
            ],
            state: 'r'
          }]
        };

        var provider = new HashmapDataProvider();
        var basic_accessor = new BasicAccessor(provider);

        basic_accessor.keymaker('get', 'test_collection_data')
          .keymaker('set', 'test_collection_data');

        var collection_index_name = 'id';
        var result = AtomicFactory.create('Basic', {
          type: {
            deco: 'BaseCollection',
            type: 'Plan',
            params: collection_index_name
          },
          accessor: basic_accessor
        });

        expect(result).to.be.an.instanceof(AtomicBasic);
        var resolved = result.resolve();

        var result = resolved.observe({
          id: '1z1x',
          params: [0, 30]
        });

        expect(result.content).to.have.property('1z1x');
        expect(result.content).to.not.have.property('1x1c');
      })
    });
  });
});