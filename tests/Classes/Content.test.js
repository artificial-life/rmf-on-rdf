'use strict'

var _ = require('lodash');

var Plan = require('./Atomic/BaseTypes/Plan.js');
var Content = require('./Content.js');
var ResolvedContent = require('./ResolvedContent.js');
var BasicAccessor = require('./Atomic/Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicFactory = require('./Atomic/AtomicFactory.js');
var ObjectSelector = require('./Path/ObjectSelector.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

describe('Content', () => {
  var accessor1;
  var accessor2;
  var context;
  var provider;
  var descriptions = [];
  var content;

  beforeEach(() => {
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
  });

  it('#constructor', () => {
    expect(content).to.be.an.instanceof(Content);
  });

  describe('methods', () => {
    describe('#resolve', () => {
      it('result is instance of ResolvedContent', () => {
        var resolved = content.resolve(context);
        expect(resolved).to.be.an.instanceof(ResolvedContent);
      });

      it('result has two Plans', () => {
        var resolved = content.resolve(context);
        for (var i = 0; i < 2; i++) {
          expect(resolved.content_map).to.have.deep.property('<namespace>content.some/atom/uri#' + i)
            .that.is.an.instanceof(Plan);
        }


      });
      it('#resolve with selector', () => {
        var result = content.selector().id('<namespace>content').all().resolve();
        expect(result).to.be.an.instanceof(ResolvedContent);

        for (var i = 0; i < 2; i++) {
          expect(result.content_map).to.have.deep.property('<namespace>content.some/atom/uri#' + i)
            .that.is.an.instanceof(Plan);
        }

        expect(result.content_map).to.not.have.property('<namespace>attribute');
      });
    });

    describe('#selector', () => {
      it('getting selector', () => {
        expect(content.selector()).to.be.an.instanceof(ObjectSelector);
      })
    });

    describe('#save', () => {
      it('saving two Plan-s', () => {
        var plan1 = new Plan();
        var plan2 = new Plan();
        var plan1_data = [{
          data: [
            [0, 100]
          ],
          state: 'r'
        }];

        var plan2_data = [{
          data: [
            [0, 50]
          ],
          state: 'r'
        }];

        plan1.build(plan1_data);

        plan2.build(plan2_data);

        var data_to_save = [{
          content: plan1,
          path: ['<namespace>content', 'some/atom/uri#0']
        }, {
          content: plan2,
          path: ['<namespace>content', 'some/atom/uri#1']
        }];

        var result = content.save(data_to_save);

        expect(result).to.deep.equal([true, true]);
        expect(TEST_STORAGE.test_plan_data1).to.deep.equal(plan1_data);
        expect(TEST_STORAGE.test_plan_data2).to.deep.equal(plan2_data);
      });


      it('returns "false" on incorrect data', () => {
        var data_to_save = ['plan1', {
          x: 2
        }];

        var result = content.save(data_to_save);

        expect(result).to.deep.equal([false, false]);

      });
    });

    describe('#addAtom', () => {
      beforeEach(() => {
        //@NOTE: reset content_map
        content.content_map = {
          '<namespace>content': null,
          '<namespace>attribute': null
        };
      });

      it('add to content by default', () => {


        var item = {
          content_type: 'Basic',
          type: 'Plan',
          accessor: accessor1
        };

        var atom = AtomicFactory.create(item.content_type, item);
        content.addAtom(atom, 'some/atom/uri#1');

        expect(content).to.have.property('content_map')
          .that.deep.equal({
            "<namespace>content": {
              "some/atom/uri#1": atom
            },
            "<namespace>attribute": null
          });
      });

      it('add to specific namespace', () => {
        var item = {
          content_type: 'Basic',
          type: 'Plan',
          accessor: accessor1
        };

        var atom = AtomicFactory.create(item.content_type, item);
        content.addAtom(atom, 'some/atom/uri#1', '<namespace>attribute', '<namespace>services');

        expect(content).to.have.property('content_map')
          .that.deep.equal({
            "<namespace>content": null,
            "<namespace>attribute": {
              "<namespace>services": {
                'some/atom/uri#1': atom
              }
            }
          });

      });

    });
  });
});