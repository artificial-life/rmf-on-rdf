'use strict'

var _ = require('lodash');

var AtomicFactory = require('./AtomicFactory.js');
var ResolvedContent = require('./ResolvedContent.js');

class Content {
    constructor(descriptions) {
        this.descriptions = descriptions;

        this.atoms = _.map(descriptions, (item) => this.buildContent(item));
    }
    buildContent(item) {
        return AtomicFactory.create(item.content_type, item);
    }
    resolve(params) {
        var resolved = _.map(this.atoms, (atom) => atom.resolve(params));

        return new ResolvedContent(resolved, this);
    }
    save(data) {
        return _.map(data, (content, index) => {
            //@TODO: need some cheks here
            if (!content) return true;

            if (content.constructor.name !== this.descriptions[index].type) return false;

            return this.atoms[index].save(content)
        });
    }
    getAtom(name) {
        return '???'
    }
}

module.exports = Content;