'use strict'

var FactoryDataProvider = require("./FactoryDataProvider.js");
var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');


describe("FactoryDataProvider", () => {
  var tested;
  var hashmap_provider;

  beforeEach(() => {
    hashmap_provider = new HashmapDataProvider();
    tested = new FactoryDataProvider(hashmap_provider);
  });

  it("#constructor", () => {
    expect(tested).to.be.an.instanceof(FactoryDataProvider);
  });

  describe("methods", () => {

    describe("#some method name", () => {
      it("test", () => {

      })
    });

  });
});