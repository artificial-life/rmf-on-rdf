'use strict'

var _ = require('lodash');
var uuid = require('node-uuid');


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

    provider = new HashmapDataProvider();

    //@NOTE: building sources
    accessor1 = new BasicAccessor(provider);
    accessor1.keymaker('set', 'test_plan_data1')
      .keymaker('get', 'test_plan_data1');

    let atom = AtomicFactory.create('Basic', {
      type: 'Plan',
      accessor: accessor1
    });

    resoucre_source = new Content();
    resoucre_source.addAtom(atom, 'plan');

    //@NOTE: building factory
    //@NOTE: prepare variables
    let size = 10;
    let box_id = 'box_id';
    let hash_id = 'hash_id';
    let data_model = {
      type: {
        deco: 'Box',
        type: ['Plan'], //inherit model from RS ingredient
        params: hash_id
      },
      deco: 'BaseCollection',
      params: box_id
    };

    let factory_provider = new FactoryDataProvider();

    let ingredient_provider = new IngredientDataProvider();
    ingredient_provider
      .setIngredient(['<namespace>content', 'plan'], 'plan', resoucre_source)
      .setSize(size);

    factory_accessor = new BasicAccessor(factory_provider);
    factory_accessor.keymaker('set', 'build')
      .keymaker('get', (p) => p);

    let storage_accessor = new BasicAccessor(provider);
    storage_accessor.keymaker('set', (p) => p.key)
      .keymaker('get', (p) => {
        let keys = p[box_id];

        if (keys == '*') {
          //@NOTE: and?
          //@NOTE: submit view key
          //@IDEA: new View('view-name',params), parse view in DP
          return _.reduce(TEST_STORAGE, (result, item, index) => {
            if (~index.indexOf('box')) result.push(index);
            return result;
          }, []);
        }

        if (_.isArray(keys)) return keys;

        return keys;
      });

    factory_provider
      .addIngredient(ingredient_provider)
      .addStorage(storage_accessor);


    let box_builder = AtomicFactory.create('Basic', {
      type: data_model,
      accessor: factory_accessor
    });

    let box_storage = AtomicFactory.create('Basic', {
      type: data_model,
      accessor: storage_accessor
    });

    factory = new ResourceFactory();
    factory
      .addAtom(box_builder, 'box', '<namespace>builder')
      .addAtom(box_storage, 'box');
  });

  describe('basic observe\reserve', () => {
    describe('#build', () => {
      it('build concrete', () => {

        factory.selector().reset()
          .add()
          .id('<namespace>builder').id('box').query({});

        var produced = factory.build({
          count: 2
        });
        //console.log(produced.length);
        // produced.selector().reset().add()
        //   .id('<namespace>builder').id('box').query({
        //     box_id: [0, 1, 2, 3],
        //     selection: {
        //       plan: [0, 101]
        //     }
        //   });
        // produced.observe();
        //
        // console.log(produced.length);
        produced.save();

        factory.selector().reset()
          .add()
          .id('<namespace>content').id('box').query({
            box_id: '*',
            selection: {
              plan: [0, 1000]
            }
          });

        produced = factory.resolve();

        console.log(produced.getAtom(['<namespace>content', 'box']));
      });

      it('bts', () => {
        bts_ingredient_provider.setIngredient(['<namespace>builder', 'plan'], TimeSlotsFactory);

        bts.selector().reset()
          .add()
          .id('<namespace>builder').id('timeslot').query({
            box_id: 'build',
            selection: {
              plan: [0, 100]
            }
          })
          .mask().id('<namespace>attribute').id('service').id('service1');

        bts.selector()
          .add()
          .id('<namespace>content').id('user_info').id('datastore').query({
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