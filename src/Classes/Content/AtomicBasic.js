'use strict'

//Content with writable initial data storage
//storage should be represented as static data, not function

class AtomicBasic {
    constructor(Model, accessor) {
        this.Model = Model;
        this.accessor = accessor;
    }
    resolve(params) {
        var data = this.accessor.get(params);
        return this.builder(data);
    }
    save(data) {
        return this.accessor.set(data);
    }
    builder(data) {
        var Model = this.Model;
        var obj = new Model();
        obj.build(data);
        return obj;
    }
}



module.exports = AtomicBasic;