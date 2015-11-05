'use strict'

var ArrayIterator = require('./ArrayIterator.js')

var iterator = new ArrayIterator([1, 2, 3, 4, 5, 6, 7, 8, 9]);

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());