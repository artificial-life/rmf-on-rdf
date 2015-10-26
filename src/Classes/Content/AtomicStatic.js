'use strict'

var AtomicBasic = require('./AtomicBasic.js');

class AtomicStatic extends AtomicBasic {
    constructor(Model, data) {
        super(Model, data);
        this.readOnly = false;
    }
    readOnly(value) {
        this.read_only = value;
    }
    resolve(params) {
        var initial = super.resolve(params);

        //@TODO: data provider or smth like this???
        //var stored = dataProvider.get(??)
        //var complete = intial + stored;
        //return complete;
    }
    save() {
        if (this.read_only) throw new Error('Read only atomic content');

        var status = false;

        return status;
    }
}



module.exports = AtomicStatic;