'use strict'
var AtomicBasic = require('./AtomicBasic.js');

class AtomicStatic extends AtomicBasic {
    constructor(Model, accessor) {
        super(Model, accessor.data_accessor)

        this.static_accessor = accessor.static_accessor;

        this.readOnly(false);
        this.reload();
    }
    readOnly(value) {
        this.read_only = value;
    }
    resolve(params) {
        var initial = this.static_data;
        var stored = this.accessor.get(params);

        var Model = this.Model;

        var initial_object = initial instanceof Function ? this.builder(initial(params)) : initial;

        var stored_object = this.builder(stored);
        //OR PUT???
        var result = initial_object.intersection(stored_object);

        return result;
    }
    save(data) {
        if (this.read_only) throw new Error('Read only atomic content');

        return super.save(data);
    }
    reload() {
        this.static_data = this.static_accessor.get();
        if (this.static_data instanceof Function) return;

        this.static_data = this.builder(this.static_data);
    }
}


module.exports = AtomicStatic;