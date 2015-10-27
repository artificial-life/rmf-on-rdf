'use strict'

var accessor = {
    //instance of object
    dataProvider: {
        get: (key) => {

        },
        set: (key) => {

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


class AtomicBasic {
    constructor(Model, accessor) {
        this.Model = Model;
        this.accessor = accessor;
    }
    resolve(params) {
        var data = this.accessor.get(params);

        var Model = this.Model;
        var data_obj = new Model(data);

        //?????
        return this.resolve_data;
    }
    save() {
        var data = "????";

        return this.accessor.save(data);
    }
}



module.exports = AtomicBasic;