'use strict'



class AtomicBasic {
    constructor(Model, data) {
        this.function_based = data instanceof Function;

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
    setDataProvider(provider) {
        this.provider = provider;

        //@TODO: sooooooo???
        return this;
    }
    save() {
        var status = false;
        return status;
    }
}



module.exports = AtomicBasic;