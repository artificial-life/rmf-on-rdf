'use strict'

var Content = require(_base + '/build/Classes/Content.js');
var BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor.js');
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

describe.only('Workflow: Basic Resource ', () => {
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

        //        console.log(result.getAtom(['<namespace>content', 'plan']));

        result.selector().reset().add()
          .id('<namespace>content').id('plan').query([50, 201]);

        result.observe();


        result.selector().reset().add()
          .id('<namespace>content').id('plan').query([0, 60]);

        result.observe();
        // console.log(result.getAtom(['<namespace>content', 'plan']));
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
        var result = content.selector().reset().add().id('<namespace>content').id('plan');

      });
    });

    describe('#reset', () => {
      it('reset to initial state')
    });

    describe('#reserve', () => {
      it('reserve subspace', () => {
        //@TODO: remove this as soon as possible
        /*        content.path.reset();

                content.selector().reset();
                content.selector().next().id('<namespace>content').id('plan').observe([1, 20]);
                content.selector().next().id('<namespace>attribute').id('service').observe({
                  service_id: 'all',
                  some_id: [1, 2, 3, 4, 5],
                  data: [1, 20]
                });
                new ComputedC({
                  source: Content1,
                  containers: [Contents]
                });

                attribute - > animals - > lamas - > * - > atom_lama
                attribute - > animals - > hippos - > * - > atom_hippo
                content - > plan - > form 1 to 20(time)
                attribute - > service - > * - > form 1 to 20
        */
        var result = content.resolve();
        var status;
        status = result.reserve([
          [50, 300]
        ]);
        //_.forEach(result.getAtom(['<namespace>content', 'plan']).content, (item) => console.log(item, item.state.mark));
        //@NOTE: this must throw error or had bad status
        status = result.reserve([
          [50, 100]
        ]);
        //_.forEach(result.getAtom(['<namespace>content', 'plan']).content, (item) => console.log(item, item.state.mark));
        //@NOTE: this must be successful
      });

      it('reserve all', () => {
        var result = content.selector().id('<namespace>content').id('plan').resolve();
        result.reserve();
        //@NOTE: this must throw error or had bad status
        result.observe([
          [50, 100]
        ]);
        result.reserve();
        //@NOTE: this must be successful
      });

      it('reserve all and save', () => {
        var result = content.selector().id('<namespace>content').id('plan').resolve();
        result.reserve();
        result.save();
      });
    });
  })
})