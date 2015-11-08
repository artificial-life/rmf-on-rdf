'use strict'

var Condition = require('./Condition.js');

describe('Condition', () => {
  var condition;

  beforeEach(() => {
    condition = new Condition('@temp:my/condition/1');
  });
  describe('common API', () => {
    it('constructor', () => {
      expect(condition).to.be.an.instanceof(Condition);
    });
    it('URI', () => {
      var uri = condition.getURI();
      expect(uri).to.equal('@temp:my/condition/1');
    });
    it('attributes', () => {
      var service1 = new Condition('@temp:my/service/1');
      condition.addAttribute('service', service1);

      expect(condition)
        .to.have.deep.property('attribute_map.service')
        .with.deep.property('@temp:my/service/1');
    });

    it('consumable', () => {

    });
    it('not consumable condition', () => {

    });

    describe('content', () => {
      it('setContent', () => {

      });
      it('getContent', () => {


      });
    });
  });

  describe('querying API', () => {
    it('observe', () => {});
    it('reserve', () => {});
    it('resolve', () => {});
    it('intersection', () => {});

  })

});