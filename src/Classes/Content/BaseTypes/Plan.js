'use strict'

var _ = require('lodash');

var TimeChunk = require('./Primitive/TimeChunk.js');
var BasicVolume = require('./BasicVolume.js');
var ZeroDimensional = require('./ZeroDimensionalVolume.js');

class Plan extends BasicVolume {
    constructor(parent) {
        super(parent);

        this.description = TimeChunk.params_description;

        this.PrimitiveVolume = TimeChunk;
    }
    clone(parent) {
        return new Plan(parent);
    }
    sort() {
        this.content = _.sortBy(this.content, function (chunk) {
            return this.start;
        });
    }
    observe(params) {
        return this.query.reset().addParams(params).filter(this);
    }
    reserve(params) {

    }
    getData() {
        var data = _.map(this.content, (chunk) => {
            return chunk.toJSON();
        });
        return data;
    }
    intersection(plan, solid = false) {
        var other_content = [];

        if (plan instanceof ZeroDimensional) {
            var state = plan.getContent().getState();
            var chunk = new TimeChunk([[-Infinity, Infinity]], state);
            other_content = [chunk];
        } else
        if (plan instanceof Plan) {
            other_content = plan.getContent();
        } else
        if (plan instanceof TimeChunk) {
            other_content = [plan];
        }

        var result = [];

        _(this.getContent()).forEach((chunk) => {
            _(other_content).forEach((second_chunk) => {
                var local_intersection = chunk.intersection(second_chunk);

                if (local_intersection) result.push(solid ? chunk : local_intersection);

            }).value();
        }).value();

        var plan = new Plan(this);
        plan.build(result);

        return plan;
    }
    union(plan) {
        if (this.content.length == 0) return plan.copy();
        if (plan.content.length == 0) return this.copy();

        var f_n = this.negative();
        var s_n = plan.negative();

        return f_n.intersection(s_n).negative();
    }
    negative() {
        var start = -Infinity,
            end;
        var result = [];

        _(this.content).forEach((chunk, index) => {
            end = chunk.start;
            if (start != end) {
                result.push({
                    data: [[start, end]],
                    state: 'a'
                });
            }
            start = chunk.end;

        }).value();


        if (start != Infinity) {
            result.push({
                data: [[start, Infinity]],
                state: 'a'
            });
        }
        var plan = new Plan(this);
        plan.build(result);

        return plan;
    }
    copy() {
        var ch = _.map(this.content, (chunk) => chunk.toJSON());
        var plan = new Plan(this);
        plan.build(ch);

        return plan;
    }
    split(size) {
        var result = [];
        var plan = new Plan(this);

        _.forEach(this.content, (chunk) => {
            _.forEach(chunk.split(size), (item) => {
                if (item) result.push(item)
            });
        });

        plan.build(result);

        return plan;
    }
}

module.exports = Plan;