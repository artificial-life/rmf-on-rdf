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



  });

  describe('basic observe\reserve', () => {
    describe('#build', () => {
      it('build concrete', () => {
        factory.select().reset().id('<namespace>content').id('plan').query({
          plan_id: 1,
          data: [0, 50]
        });

        factory.select().next().id('<namespace>attribute').id('service').query({
          service_id: 1,
          data: [0, 50]
        });

        factory.select().build();

      });

      it('observe mixed', () => {
        factory.select().reset().id('<namespace>content').id('plan').query({
          plan_id: 'promise',
          data: [0, 50]
        });

        factory.select().next().id('<namespace>attribute').id('service').query({
          service_id: 1,
          data: [0, 50]
        });

        factory.select().build();

      });

      it('build functional', () => {
        factory.select().reset().id('<namespace>content').id('plan').query({
          plan_id: 'promise',
          data: 'nearest'
        });

        factory.select().next().id('<namespace>attribute').id('service').query({
          service_id: 1,
          data: 'nearest'
        });

        factory.select().build();

      });

      it('build functional two attributes', () => {
        factory.select().reset().id('<namespace>content').id('plan').query({
          plan_id: 'promise',
          data: 'nearest'
        });

        factory.select().next().id('<namespace>attribute').id('service').query({
          service_id: 1,
          data: 'nearest'
        });

        factory.select().next().id('<namespace>attribute').id('age').query({
          operator_id: 1,
          data: 'oldest'
        });

        factory.select().build();

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