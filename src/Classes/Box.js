'use strict'

var uuid = require('node-uuid');

var ResolvedContent = require('./ResolvedContent.js');

class Box extends ResolvedContent {
	constructor(parent) {
		super(parent);
		this.box_id = null;
	}
	save() {
		if(!this.box_id) this.box_id = uuid.v1();
		var path = this.selector().traverse();

		var atom_data;
		var result = [];

		for(atom_data of path) {
			var {
				atom_path: atom_path,
				atom: atom
			} = atom_data;
			//  console.log(atom_path, atom);
			//  console.log(this.parent.getAtom(atom_path));

			let status = this.parent.getAtom(atom_path).save(atom, true);

			//result.push(status);
		}

		return result;
	}
}

module.exports = Box;