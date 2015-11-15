'use strict'

var Content = require(_base + '/build/Classes/Content.js');
var BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');
var AtomicComputed = require(_base + '/build/Classes/Atomic/AtomicComputed.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

describe('Workflow: Resource with compound atom', () => {
  var accessor1;
  var accessor2;
  var provider;
  var content;

  before(() => {

    provider = new HashmapDataProvider();
    accessor1 = new BasicAccessor(provider);
    accessor2 = new BasicAccessor(provider);

    TEST_STORAGE.test_plan_data1 = [{
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

    TEST_STORAGE.test_plan_data2 = [{
      data: [
        [50, 100]
      ],
      state: 'a'
    }, {
      data: [
        [120, 240]
      ],
      state: 'a'
    }];

    accessor1.keymaker('set', 'test_plan_data1')
      .keymaker('get', 'test_plan_data1');

    accessor2.keymaker('set', 'test_plan_data2')
      .keymaker('get', 'test_plan_data2');


    content = new Content();

    var source_atom = AtomicFactory.create('Basic', {
      type: 'Plan',
      accessor: accessor1
    });

    var container = AtomicFactory.create('Basic', {
      type: 'Plan',
      accessor: accessor2
    });

    var computed = new AtomicComputed(source_atom);
    computed.addAtom(container);
    content.addAtom(computed, 'plan');

  });

  describe('basic observe\reserve', () => {
    describe('#observe', () => {
      it('observe', () => {
        var result = content.selector().id('<namespace>content').id('plan').resolve();
        //  console.log(result.getAtom(['<namespace>content', 'plan']));
        result.observe([
          [50, 300]
        ]);
        //  console.log(result.getAtom(['<namespace>content', 'plan']));
        result.observe([
          [0, 201]
        ]);
        //console.log(result.getAtom(['<namespace>content', 'plan']));

      });
    });

    describe('#reserve', () => {
      it('reserve subspace', () => {
        var result = content.selector().id('<namespace>content').id('plan').resolve();

        result.reserve([
          [50, 300]
        ]);


      });

      it('reserve all', () => {
        var result = content.selector().id('<namespace>content').id('plan').resolve();
        result.reserve();
      });

      it('reserve all and save', () => {
        var result = content.selector().id('<namespace>content').id('plan').resolve();
        result.reserve();
        result.save();
      });
    });
  })
})