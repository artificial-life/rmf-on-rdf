'use strict'

var accessor = {
    dataProvider: {
        set: () => {
            //replace
        }
    },
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
//extends Accessor
var CPaccessor = {
    dataProvider: {
        get: (key) => {
            //super
        },
        set: () => {
            //not used
        },
        upsert: () => {

        }
    },
    makeAccessObject: {
        //super
    },
    makeInitial: (context) => {
        var now = _.now();
        return this.schedules[now.day];
    },
    get: (context) => {
        var result = super.get(context);
        return result ? result : this.makeInitial();
    },
    set: (data) => {
        var key_obj = this.makeAccessObject.set(data);
        dataProvider.upsert(key_obj, data);
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

        var initial_object = initial instanceof Function ? this.builder(initial(params)) : initial;

        var stored_object = this.builder(stored);
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

        this.accessor.set(diff(inital, current));

        return status;
    }
    reload() {
        this.static_data = this.static_accessor.get();
        if (this.static_data instanceof Function) return;

        this.static_data = this.builder(this.static_data);
        //it could be "static" function
    }
    builder(data) {
        var Model = this.Model;
        var obj = new Model();
        obj.build(data);

        return obj;
    }
}



module.exports = AtomicStatic;