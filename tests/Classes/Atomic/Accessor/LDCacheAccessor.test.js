'use strict'

let LDCacheAccessor = require('./LDCacheAccessor');
let CouchbirdLinkedDataProvider = require(_base + '/build/externals/CouchbirdLinkedDataProvider');
//let RDFcb = require("cbird-rdf").LD;

let HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
let TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');


describe("LDCacheAccessor", () => {
  let vocab_basic = require(_base + "/tests/data/iris_basic.json");
  let vocab_domain = require(_base + "/tests/data/iris_domain.json");
  let cfg = {
    "couchbird": {
      "server_ip": "127.0.0.1",
      "n1ql": "127.0.0.1:8093"
    },
    "bucket": "rdf",
    "vocabulary": {
      "basic": "iris://vocabulary/basic",
      "domain": "iris://vocabulary/domain",
      "fs": false
    },
    "data_prefix": "iris://data"
  };
  let classmap = {
    prefix: {
      data: cfg.data_prefix,
      basic: cfg.vocabulary.basic,
      domain: cfg.vocabulary.domain
    },
    classes: {
      plan: {
        template: "schedule",
        map_keys: {
          "iris://vocabulary/domain#scheduleDescription": "iris://vocabulary/domain#planDescription",
          "iris://vocabulary/domain#scheduleOf": "iris://vocabulary/domain#planOf"
        },
        typecast: "iris://vocabulary/domain#Plan"
      }
    }
  };
  let db = null;
  let bucket = null;
  let dp = null;
  let accessor = null;

  let test_sch = {
    "@id": "iris://data#schedule-1",
    "@type": [
      "iris://vocabulary/domain#Schedule"
    ],
    "iris://vocabulary/domain#scheduleDescription": [{
      "@value": "[[32400000, 46800000], [50400000, 64800000]]"
    }],
    "iris://vocabulary/domain#scheduleOf": [{
      "@id": "iris://data#human-1"
    }]
  };

  let test_plan = {
    "@id": "iris://data#plan-1",
    "@type": [
      "iris://vocabulary/domain#Plan"
    ],
    "iris://vocabulary/domain#planDescription": [{
      "@value": "[[32400000, 46800000], [50400000, 64800000]]"
    }],
    "iris://vocabulary/domain#planOf": [{
      "@id": "iris://data#human-1"
    }]
  };

  before(() => {
    db = new RDFcb(cfg.couchbird);
    bucket = db.bucket(cfg.bucket);
    bucket.upsert("iris://vocabulary/basic", vocab_basic);
    bucket.upsert("iris://vocabulary/domain", vocab_domain);
    //not necessary yet
    bucket.installViews();
    bucket.setVocabulary(cfg.vocabulary);
    dp = new CouchbirdLinkedDataProvider(bucket);
    bucket.upsertNodes(test_sch);
    // dp = new HashmapDataProvider(); //temporary
    // TEST_STORAGE[test_sch["@id"]] = test_sch;
    accessor = new LDCacheAccessor(dp);
  });

  beforeEach(() => {
    // accessor.template();
  });

  describe('#constructor', () => {
    it('should be constructed', () => {
      expect(accessor).to.be.an.instanceof(LDCacheAccessor);
    });
  });

  describe('methods', () => {

    describe('#mapper', () => {
      it('should set a classmap', () => {
        accessor.mapper(classmap);
        expect(accessor).to.have.property('class_map').which.is.eql(classmap);
        expect(accessor).to.have.property('template').which.is.an.instanceof(Function);
      });
    });
    describe('#template', () => {
      it('should set default template function', () => {
        accessor.template();
        expect(accessor).to.have.property('template_maker').which.is.an.instanceof(Function);
      });
      it('should set template function', () => {
        accessor.template(() => 'test');
        expect(accessor).to.have.property('template_maker').which.is.an.instanceof(Function);
        expect(accessor.template_maker()).to.equal('test');
      });
    });
    describe('#get', () => {
      it('should not retrieve anything', (done) => {
        accessor.keymaker('get', (x) => x);
        accessor.mapper(classmap);
        accessor.template();
        let result = accessor.get('magic')
          .then((res) => {
            expect(res).to.be.undefined;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('should retrieve original doc', (done) => {
        accessor.keymaker('get', (x) => x);
        accessor.mapper(classmap);
        accessor.template();
        let result = accessor.get(test_sch["@id"])
          .then((res) => {
            expect(res['value']).to.eql(test_sch);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      it('should retrieve templated doc', (done) => {
        accessor.keymaker('get', (x) => x);
        accessor.mapper(classmap);
        accessor.template();
        let result = accessor.get(cfg.data_prefix + "#plan-1")
          .then((res) => {
            expect(res).to.eql(test_plan);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });

    });

  });
});