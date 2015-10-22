'use strict'
var module_cache = {};
var discover = (name) => {
    var fullpath = `./BaseTypes/${name}.js`;

    if (!module_cache.hasOwnProperty(fullpath)) {
        module_cache[fullpath] = require(fullpath);
    }

    return module_cache[fullpath];
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
            var model_object = new Model();
            model_object.build(data);
            this.resolve_data = model_object;

        }

    }
    resolve(params) {
        if (this.function_based) {
            var data = this.resolve_data.fn(params);
            var Model = this.resolve_data.model;
            var model_object = new Model();
            model_object.build(data);
            return model_object;
        }

        return this.resolve_data;
    }
}



module.exports = AtomicContent;