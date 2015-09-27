'use strict'

class Collection {
    constructor(index_name, povs) {
        this.map = {};
        this.index_name = index_name;

        _.forEach(povs, (pov) => {
            var uri = pov.getURI();
            this.map[uri] = pov;
        });
    }
    observe(params) {
        var ids = params[this.index_name];

        var observed = _.filter(this.map, (pov) => {
            return !!~ids.indexOf(pov.getURI());
        });

        var result = _.map(observed, (pov) => pov.observe(params));

        return new Collection(result);
    }
    reserve() {

    }
}

module.exports = Collection;