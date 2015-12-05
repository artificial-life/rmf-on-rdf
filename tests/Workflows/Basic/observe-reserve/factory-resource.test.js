'use strict'

var Content = require(_base + '/build/Classes/Content.js');
var ResourceFactory = require(_base + '/build/Classes/ResourceFactory.js');
var BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor.js');
var FactoryDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/FactoryDataProvider.js');
var FactoryIngredient = require(_base + '/build/Classes/Atomic/DataProvider/Ingredient/FactoryIngredient.js');

var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');

var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

describe('Workflow: Factory linked to single RS', () => {
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

    var size = [{
      atom_path: ['<namespace>content', 'plan'],
      size: 10
    }];

    var ingredient = new FactoryIngredient(resoucre_source, size);

    factory_provider.addIngredient(ingredient);

    factory_provider.addAlgorithm((ing) => [ing]);

    factory_accessor = new BasicAccessor(factory_provider);

    factory_accessor.keymaker('set', (p) => p)
      .keymaker('get', (p) => p);

    var builder = AtomicFactory.create('Basic', {
      type: 'Shelf',
      accessor: factory_accessor
    });
    factory.addBuilder(builder);

  });

  describe('basic observe\reserve', () => {
    describe('#build', () => {
      it('build concrete', () => {

        var resolved_content = factory.build({
          data: [70, 150],
          count: 1
        });

        var shelf = resolved_content.getAtom(['<namespace>content', 'builder']);
      });

      it('observe mixed', () => {
        factory.select().reset().add().id('<namespace>content').id('plan').query({
          data: 'nearest',
          count: 1
        });


        factory.build();

      });

      it('checking available slots', () => {
        //"box_id" NOT specified => build

        //factory_accessor instanceof BasicAccessor

        factory_accessor.keymaker('get', (p) => p);

        factoryDataProvider.get(params) {
          if (params.hasOwnProperty(this.collection_id)) {
            return this.storageDataProvider.get(params);
          } else {
            return this.ingredientDataProvider.get(params);
          }
        }

        factoryDataProvider.ingredientDataProvider = RMFingredientDataProvider;

        RMFingredientDataProvider.get(p) {
          var resolved = this.ingredient_atom.resolve(p).observe(p);

          var splitted_content = resolved.split(this.size).getContent().splice(0, p.count); //array of TimeChunk

          if (splitted_content.length != p.count) throw new DogeError({
            so: 'few ingredients',
            such: 'much boxes'
          });

          return _.map(splitted_content, (chunk) => chunk.toJSON())
        }

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