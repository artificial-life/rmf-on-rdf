'use strict'

var accessor = {
    dataProvider: {},
    makeAccessObject: {
        get: (context) => {
            return 'access_string';
        },
        set: (context) => {
            return 'access_string';
        }
    },
    get: (context) => {
        var key_obj = this.makeAccessObject.get(context);
        return dataProvider.get(key_obj);
    },
    set: (data) => {
        var key_obj = this.makeAccessObject.set(data);
        return dataProvider.set(key_obj, data);
    }

};


class AtomicStatic {
    constructor(Model, data_accessor, static_accessor) {

        this.Model = Model;
        this.accessor = data_accessor;
        this.static_accessor = static_accessor;

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

        var initial_object = initial instanceof Function ? new Model(initial(params)) : initial;

        var stored_object = stored instanceof Function ? new Model(stored(params)) : stored;
        //OR PUT???
        var result = initial_object.intersection(stored_object);
        //@TODO: data provider or smth like this???
        //var stored = dataProvider.get(store_accessor);
        //var complete = intial + stored;
        //return complete;
    }
    save() {
        if (this.read_only) throw new Error('Read only atomic content');

        var status = false;

        return status;
    }
    reload() {
        this.static_data = this.static_accessor.get();
        if (this.static_data instanceof Function) return;

        //it could be "static" function
    }
}



module.exports = AtomicStatic;