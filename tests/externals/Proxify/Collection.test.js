'use strict'


var ProxifyCollection = require("./Collection.js");


describe("Collection", () => {
  var tested;

  beforeEach(() => {
    tested = ProxifyCollection({
      collection_id: 'id',
      collectionMethod: function(method_name, params) {
        return [method_name, params];
      },
      multiply: function(one, two, three) {
        return one * two * three;
      }
    });
  });

  it('call some method without "id"', () => {
    expect(tested.multiply(3, 2, 1)).to.equal(6);
  });

  it('call unknown method throws error', () => {
    expect(tested.non_existent_method).to.throw(Error);
  });

  it('get collection_id as property', () => {
    expect(tested.collection_id).to.equal('id');
  });

  it('call non existent in collection method with "id"', () => {
    expect(tested.x({
      id: 1
    })).to.deep.equal(['x', {
      id: 1
    }]);
  });

  it('throws error without parameters', () => {
    expect(ProxifyCollection).to.throw(Error);
  });

});