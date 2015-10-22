'use strict'

var discover = (name) => {
    //goto  datatype, search for name, store it etc.
};

//Ответственность: создание и разрешение Атомарного Контента из базового типа

class AtomicContent {
    constructor(params) {
        var type = params.type;
        var data = params.data;
        this.function_based = data instanceof Function;
        var Model = discover(type);

        if (this.function_based) {
            this.resolve_data = {
                model: Model,
                fn: data
            };
        } else {
            this.resolve_data = new Model(data);
        }

    }
    resolve(params) {
        if (this.function_based) {
            var data = this.resolve_data.fn(params);
            var Model = this.resolve_data.model;
            return new Model(data);
        }

        return this.resolve_data;
    }
}



mdoule.exports = AtomicContent;