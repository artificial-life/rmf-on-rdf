'use strict'

var _ = require('lodash');
var PrimitiveVolume = require('./PrimitiveVolume.js');

//@TODO: init_data model [[]] is ugly. should remove one brackets
class TimeChunk extends PrimitiveVolume {
  constructor(init_data, state = 'a') {
    super(init_data, state);
  }
  set data(description) {
    this.default = [
      [-Infinity, Infinity]
    ];

    if (_.isArray(description)) {
      [
        [this.start, this.end]
      ] = description.length ? description : this.default;
    }

    return this;
  }
  reserve() {

  }
  getState() {
    return this.state;
  }
  toJSON() {
    return {
      data: [
        [this.start, this.end]
      ],
      state: this.getState().toString()
    };
  }
  intersection(chunk) {
    var start = _.max([this.start, chunk.start]);
    var end = _.min([this.end, chunk.end]);
    var state = this.getState();

    if (start >= end) return false;

    return new TimeChunk([
      [start, end]
    ], state);
  }
  intersectsWith(chunk) {
    return (this.start >= chunk.start && this.start <= chunk.end) || (this.end >= chunk.start && this.end <= chunk.end)
  }
  getLength() {
    return this.end - this.start;
  }
  split(size) {
    var length = this.getLength();

    if (size > length) return [];

    var count = length / size | 0;
    var result = [];

    for (var i = 0; i < count; i += 1) {
      result.push(new TimeChunk([
        [this.start + i * size, this.start + (i + 1) * size]
      ]));
    }

    return result;
  }
  cut(chunk) {
    var result = [];

    if (_.inRange(chunk.start, this.start, this.end) && chunk.start > this.start) {
      var first = new TimeChunk([
        [this.start, chunk.start]
      ], this.state);
      result.push(first);
    }

    if (_.inRange(chunk.end, this.start, this.end)) {
      var second = new TimeChunk([
        [chunk.end, this.end]
      ], this.state);
      result.push(second);
    }

    return result;
  }
  union(chunk) {
    if (!this.intersectsWith(chunk)) return false;
    var start = _.min(this.start, chunk.start);
    var end = _.max(this.end, chunk.end);

    return new TimeChunk([
      [start, end]
    ]);
  }
}


module.exports = TimeChunk;