'use strict'

var _ = require('lodash');

var Content = require('./Content.js');
var FactoryContent = require('./FactoryContent.js');

class Factory extends Content {
  constructor() {
    super(FactoryContent);
  }
  build(params) { //@NOTE: that's specific to factory content
    //@TODO: rework  it when multiple selectors would be done
    this.selector().query_params = _.assign(this.selector().query_params, params);

    var resolved = this.resolve();

    return resolved;
  }
}

module.exports = Factory;