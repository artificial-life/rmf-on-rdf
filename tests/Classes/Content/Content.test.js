'use strict'

var Plan = require('./BaseTypes/Plan.js');
var Content = require('./Content.js');
var ResolvedContent = require('./ResolvedContent.js');
var BasicAccessor = require('./Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicFactory = require('./AtomicFactory.js');
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

    content = new Content(descriptions);
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
        expect(resolved.content).to.have.length(2);
        expect(resolved.content).to.have.deep.property('[0]')
          .that.is.an.instanceof(Plan);
        expect(resolved.content).to.have.deep.property('[1]')
          .that.is.an.instanceof(Plan);
      });
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

        var data_to_save = [plan1, plan2];

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
    describe('#isEditable', () => {
      it('editable by default', () => {
        var iseditable = content.isEditable();
        expect(iseditable).to.be.ok;
      });

      it('setter "true"/"false"', () => {
        content.editable = false;
        var iseditable = content.isEditable();
        expect(iseditable).to.be.not.ok;

        content.editable = true;
        iseditable = content.isEditable();
        expect(iseditable).to.be.ok;
      });
    });

    describe('#resolveAll', () => {
      it('empty content resolves to empty', () => {
        var resolved = content.resolveAll();
        expect(resolved).is.an.instanceof(ResolvedContent);
        expect(resolved.content).is.empty;
      });

      it('resolve not empty content', () => {
        var item = {
          content_type: 'Basic',
          type: 'Plan',
          accessor: accessor1
        };
        var atom = AtomicFactory.create(item.content_type, item);
        content.addAtom(atom, 'some/atom/uri#1');

        var resolved = content.resolveAll();
        var resolved_atom = atom.resolve();

        expect(resolved).is.an.instanceof(ResolvedContent);
        expect(resolved.content).to.have.length(1);
        expect(resolved.content[0]).to.deep.equal(resolved_atom);
      });
    });

    describe('#addAtom', () => {
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