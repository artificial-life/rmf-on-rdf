'use strict'

var Content = require(_base + '/build/Classes/Content.js');
var BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

describe('Workflow: Basic Resource ', () => {
  var accessor1;
  var provider;
  var content;

  before(() => {

    provider = new HashmapDataProvider();
    accessor1 = new BasicAccessor(provider);

    TEST_STORAGE.test_plan_data1 = [{
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

    accessor1.keymaker('set', 'test_plan_data1')
      .keymaker('get', 'test_plan_data1');

    var description = {
      type: 'Plan',
      accessor: accessor1
    };

    content = new Content();


    var atom = AtomicFactory.create('Basic', description);
    content.addAtom(atom, 'plan');

  });

  describe('basic observe-reserve', () => {
    describe('#observe', () => {
      it('observe all', () => {
        var result = content.resolve();

        result.selector().reset().add()
          .id('<namespace>content').id('plan').query([0, 300]);

        result.observe();

        result.selector().reset().add()
          .id('<namespace>content').id('plan').query([50, 201]);

        result.observe();


        result.selector().reset().add()
          .id('<namespace>content').id('plan').query([0, 60]);

        result.observe();
        var observed = result.getAtom(['<namespace>content', 'plan']);

        expect(observed.getContent()).to.have.length(1);
        expect(observed.getContent()).to.have.deep.property('[0].start', 50);
        expect(observed.getContent()).to.have.deep.property('[0].end', 60);
      });

      it('observe state', () => {
        var result = content.resolve();

        result.selector().reset().add()
          .id('<namespace>content').id('plan').query([50, 400]);

        result.observe();

        result.selector().reset().add()
          .id('<namespace>content').id('plan').query({
            state: 'a'
          });

        result.observe();

        var observed = result.getAtom(['<namespace>content', 'plan']);
        var observed_content = observed.getContent();

        expect(observed_content).to.have.length(1);
        expect(observed_content).to.have.deep.property('[0]').to.contain.all.keys({
          start: 50,
          end: 100
        });
      });


      it('observe partial', () => {
        content.selector().reset().add().id('<namespace>content').id('plan');

        var result = content.resolve();

        result.selector().reset().add()
          .id('<namespace>content').id('plan').query([0, 60]);
        result.observe();

        var observed = result.getAtom(['<namespace>content', 'plan']);
        var observed_content = observed.getContent();

        expect(observed_content).to.have.length(1);
        expect(observed_content).to.have.deep.property('[0]').to.contain.all.keys({
          start: 0,
          end: 60
        });
      });
    });

    describe('#reset', () => {
      it('reset to initial state', () => {
        var result = content.selector().reset().resolve();

        result.selector().reset().add()
          .id('<namespace>content').id('plan').query([0, 300]);

        result.observe();

        result.reset();
        var reseted = result.getAtom(['<namespace>content', 'plan']);
        expect(reseted.parent).to.not.be.ok;
      })
    });

    describe('#save', () => {
      it('save all changes')
    });

    describe('#reserve', () => {
      it('reserve subspace', () => {
        var result = content.resolve();
        result.selector().reset().add()
          .id('<namespace>content').id('plan').query([
            [30, 50]
          ]);

        var result = result.reserve();
        var reserved_content = result.getAtom(['<namespace>content', 'plan']).getContent();
        //@NOTE: this must be successful
      });

      it('reserve wrong subspace')
      it('reserve all');

      it('reserve all and save');
    });

  })
})