'use strict'

var Plan = require('./Plan.js');
var BaseCollection = require("./BaseCollection.js");

describe("BaseCollection", () => {
  var tested;

  beforeEach(() => {
    tested = new BaseCollection('id', Plan);
  });

  it("#constructor", () => {
    expect(tested).to.be.an.instanceof(BaseCollection);
  });

  describe("methods", () => {

    describe("#build", () => {
      it("build not proxified to collection");
    });

    describe("using collection methods", () => {
      it('ex. #observe');
    });
  });
});