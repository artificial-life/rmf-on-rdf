'use strict'

var _ = require('lodash');
/*
var Factory = require('??');
var Ingredient = require('??');
var POV = require('??');
var RS = require('??');
var FunctionalEntity = require('??');
var Storage = require('??');

/*===code start===*/

var OperatorPOVS = [];

//fill OperatorPOVS
const pov_count = 3;

for (var i = 0; i < pov_count; i += 1) {
    var container = null; //code here
    var basicRS = null; //some code here too

    OperatorPOVS.push(new POV([container, basicRS]));
}

var OPS = new POV(OperatorPOVS);

/*====TimeSlots====*/

var TimeSlots = new RS();

var ts_size = 10;
var TSIngredient = new Ingredient(OPS, ts_size);

var TSAlgorithm = new FunctionalEntity(function (ingredients, context) {
    var result = '';

    return result;
});

var TSFactory = new Factory({
    ingredient: [TSIngredient],
    algorithm: [TSAlgorithm]
});

var TSStorage = new Storage();

TimeSlots.extendState(TSFactory);
TimeSlots.extendState(TSStorage);

/*====Users====*/

var Users = new RS();

var UsersAlgorithm = new FunctionalEntity(function (ingredients, context) {

});

var UsersStorage = new Storage();
var UsersFactory = new Factory({
    ingredient: [],
    algorithm: [UsersAlgorithm]
});

Users.extendState(UsersFactory);
Users.extendState(UsersStorage);

/*====Booked TimeSlots====*/

var BTS = new RS();

var BTSIngredient1 = new Ingredient(TimeSlots);
var BTSIngredient2 = new Ingredient(Users);

var BTSAlgorithm = new FunctionalEntity(function (ingredients, context) {
    var result = '';

    return result;
});

var BTSFactory = new Factory({
    ingredient: [BTSIngredient1, BTSIngredient2],
    algorithm: [BTSAlgorithm]
});

//cannot be executed by factory
BTSFactory.mode('manual');

var BTSStorage = new Storage();

BTS.extendState(BTSFactory);
BTS.extendState(BTSStorage);

/*====Tests====*/

var slots = TimeSlots.observe({
    time: 'day',
    service: 1
});

var index = 0;

var picked = slots[index];

//wtf is this 
//build from ingredients?

var request = BTS.build(picked, {
    user_info: {
        name: 'nothing'
    }
});

var result = request.save();


/*====Workflow №2====*/

var Processing = new RS();

var ProcessingIngredient = new Ingredient(BTS);

var ProcessingAlgorithm = new FunctionalEntity(function (ingredients, context) {
    var result = '';

    return result;
});

var ProcessingFactory = new Factory({
    ingredient: [ProcessingIngredient],
    algorithm: [ProcessingAlgorithm]
});

//execution only on external event, not by factory chain
ProcessingFactory.mode('manual');

var ProcessingStorage = new Storage();

Processing.extendState(ProcessingFactory);
Processing.extendState(ProcessingStorage);

/*=====Test №2=====*/

var processNext = () => {
    var processing = Processing.build({
        service: 1,
        time: 'day',
        count: 1
    });

    processing.save({
        operator_id: 1
    });

    return processing;
}

processNext();


var processConcrete = () => {
    //??
    // return conrete;
}

/*=========PRICELESS METACODE HERE=======================*/

//NOTE: should make copy of RS,  linked to initial RS
RS.observe = (params) => {
    return RS.Content.observe = (params) => {
        var queried_contents = _.map(Content.atomics, (Atomic) => {
            //NOTE: this should be independent object

            var result = Atomic.observe = (params) => {
                var query_result = Atomic.query.addParams(params).execute();

                return query_result;
            };
        });

        return new Content(queried_contents);
    }
}

//NOTE: should be same object with changes
RS.reserve = (params) => {

    return RS.Content.reserve = (params) => {
        var status = _.map(Content.atomics, (Atomic) => {
            var query_result = Atomic.query.addParams(params).execute();
            //or should it be "new Atomic(params, state ='R')"??
            //NOTE: query_result should be one solid chunk
            var object_to_put = query_result.resolve().getContent()[0];
            object_to_put.changeState('R');
            //NOTE: "put" method doesnt generates new object
            var status = Atomic.put(object_to_put);

            return status;
        });
        return status;
    }
}

RS.save = () => {
    return RS.Content.save = (params) => {
        var status = _.map(Content.atomics, (Atomic) => {
            //NOTE: dunno what code should be in "save"
            return Atomic.save();
        });
        return status;
    }
}