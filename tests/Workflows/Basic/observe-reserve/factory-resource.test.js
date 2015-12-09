'use strict'

var Content = require(_base + '/build/Classes/Content.js');
var BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor.js');
var FactoryDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/FactoryDataProvider.js');
var IngredientDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/IngredientDataProvider.js');
var ResourceFactory = require(_base + '/build/Classes/ResourceFactory.js');

var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');

var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

describe.only('Workflow: Factory linked to single RS', () => {
  var resoucre_source;
  var factory_accessor;
  var factory;
  var provider;
  var content;
  var accessor1;

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

    resoucre_source = new Content();

    var atom = AtomicFactory.create('Basic', description);
    resoucre_source.addAtom(atom, 'plan');

    factory = new ResourceFactory();

    var factory_provider = new FactoryDataProvider();

    var regular_provider = new HashmapDataProvider();
    var size = 10;
    var ingredient_provider = new IngredientDataProvider();

    ingredient_provider.setSize(size);
    ingredient_provider.setIngredient(['<namespace>content', 'plan'], resoucre_source);

    factory_provider.addIngredient(ingredient_provider);
    factory_provider.addStorage(regular_provider);


    factory_accessor = new BasicAccessor(factory_provider);

    factory_accessor.keymaker('set', (p) => p)
      .keymaker('get', (p) => p);

    var box_id = 'box_id';

    var plan = AtomicFactory.create('Basic', {
      type: {
        type: 'Plan', //inherit model from RS
        deco: 'BaseCollection',
        params: box_id
      },
      accessor: factory_accessor
    });

    factory.addAtom(plan, 'plan');

  });

  describe('basic observe\reserve', () => {
    describe('#build', () => {
      it('build concrete', () => {

        factory.selector().reset()
          .add()
          .id('<namespace>content').id('plan').query({
            selection: [90, 300]
          });

        var produced = factory.build({
          count: 1
        });

        console.log([...produced.boxes()]);

        bts.selector().reset()
          .add()
          .id('<namespace>content').id('timeslot').query({
            box_id: 'build',
            selection: [0, 10]
          })
          .mask().id('<namespace>attribute').id('service').id('service1');

        bts.selector()
          .add()
          .id('<namespace>content').id('user').query({
            box_id: 'build',
            selection: {
              name: 'some_name',
              phone: '8-888-888-8'
            }
          });

        bts.build({
          count: 1
        });

      });

      it('observe mixed', () => {
        factory.selector().reset().add()
          .id('<namespace>content').id('plan').query({
            data: 'nearest'
          });


        factory.build({
          count: 1
        });

      });

      it('checking available slots', () => {
        //"box_id" NOT specified => build

        //factory_accessor instanceof BasicAccessor

        factory.selector().reset()
          .add()
          .id('<namespace>content').id('plan').query([0, 1000]);

        var produced = factory.build({
          count: 1
        });

        //use boxes iterator
        var box = produced.boxes().next();

        //box count
        var length = produced.boxes().length();

        if (length > 0) console.log('We have a timeslot for booking!');
        //this observing concrete
        produced.selector().reset().add().id('<namespace>content').id('plan').query({
          box_id: 'concrete-id',
          params: [100, 200]
        });

        produced.observe();

        //this observing all match
        produced.reset();
        produced.selector().reset().add().id('<namespace>content').id('plan').query({
          box_id: '*',
          params: [100, 200]
        });

        produced.observe();

      });
    });

    describe('#reserve', () => {
      it('reserve subspace');
    });

    describe('#observe', () => {
      it('observe what has been built');
    });
  })
})