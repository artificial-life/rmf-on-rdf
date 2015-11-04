'use strict'

var Path = require('./Path.js');

var test_map = {
    'services': {
        'service/uri1': 1,
        'service/uri2': 2,
        'service/uri3': 3
    },
    'objects': {
        'o/uri1': 1,
        'o/uri2': 2,
        'o/uri3': 3
    },
    'elephants': {
        'big': {
            'big/uri1': 1,
            'big/uri2': 2,
            'big/uri3': 3
        },
        'small': {
            'small/uri1': 1,
            'small/uri2': 2,
            'small/uri3': 3
        },
        'pink': {
            'pink/uri1': 1
        }
    }
};

var path = new Path(test_map);

path.selector('* *');
console.log(path.keys);
for (var i = 0; i < 11; i++) {
    var r = path.next();
    console.log(r);
}