'use strict'

var _ = require('lodash');

var State = require('../Primitive/State/State.js');

var transform = (first, second) => {
    var transcript = {};
    if (!second) {
        [, transcript.oldone, transcript.newbee] = first.match(/(\S*)=>(\S*)/);
        transcript.code = first;

        return transcript;
    };

    var first_str = first instanceof State ? first.mark : first;
    var second_str = second instanceof State ? second.mark : second;

    transcript.newbee = first_str;
    transcript.oldone = second_str;
    transcript.code = `${first_str}=>${second_str}`;

    return transcript;
}

const ALL = transform('*', '*');


class Strategy {
    constructor(based_on) {
        this.actions = !based_on ? {} : _.clone(based_on.actions, true);
    }
    all(fn) {
        this.actions[ALL.code] = fn;

        return this;
    }
    except(...args) {
        var fn = args.splice(-1)[0];
        var transcript = transform(...args);

        this.actions[transcript.code] = fn;

        return this;
    }
    getStrategy(...args) {
        var transcript = transform(...args);

        if (this.actions.hasOwnProperty(transcript.code)) {
            return this.actions[transcript.code];
        }

        var anyInClass = transform(transcript.newbee, '*');

        if (this.actions.hasOwnProperty(anyInClass.code)) {
            return this.actions[anyInClass.code];
        }

        if (this.actions.hasOwnProperty(ALL.code)) {
            return this.actions[ALL.code];
        }

        return false;
    }
}


module.exports = Strategy;