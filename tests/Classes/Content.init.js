'use strict'

var Content = require('./Content.js');
var BasicAccessor = require('./Atomic/Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicFactory = require('./Atomic/AtomicFactory.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

function init() {
  var accessor1;
  var accessor2;
  var context;
  var provider;
  var descriptions = [];
  var content;

  provider = new HashmapDataProvider();
  accessor1 = new BasicAccessor(provider);
  accessor2 = new BasicAccessor(provider);
  context = [
    [0, 400]
  ];

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
      [0, 50]
    ],
    state: 'a'
  }, {
    data: [
      [100, 150]
    ],
    state: 'a'
  }];

  accessor1.keymaker('set', 'test_plan_data1')
    .keymaker('get', 'test_plan_data1');

  accessor2.keymaker('set', 'test_plan_data2')
    .keymaker('get', 'test_plan_data2');

  descriptions = [{
    content_type: 'Basic',
    type: 'Plan',
    accessor: accessor1
  }, {
    content_type: 'Basic',
    type: 'Plan',
    accessor: accessor2
  }];

  content = new Content();


  _.forEach(descriptions, (item, index) => {
    var atom = AtomicFactory.create(item.content_type, item);
    content.addAtom(atom, 'some/atom/uri#' + index);
  });

  return {
    content,
    accessor1,
    accessor2
  };
}

module.exports = init;