'use strict'

class ResolvedContent {
    constructor(resolved, parent) {
        this.parent = parent;
        this.content = resolved;
    }
    save() {
        this.parent.save(this.content);
    }
}

module.exports = ResolvedContent;