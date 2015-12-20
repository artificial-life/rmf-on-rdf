'use strict'

var _ = require('lodash');

var Path = require('./Path/Path.js');

//@NOTE: may be ResolvedContent and Content should have common parent class
//@NOTE: something like AbcstractContent
//@NOTE: this will separated methods linked to content_map

class ResolvedContentAsync {
	constructor(parent) {
		if(!parent) throw new Error('parent required');
		this.parent = parent;
		this.content_map = {};
		this.path = new Path(this.content_map);
		//@NOTE: this inherits query params  from resolver
		this.path.query(parent.selector().getQueryParams());
	}
	addAtom(path, atom) {
		_.set(this.content_map, path, atom);
		return this;
	}
	getAtom(path) {
		return _.get(this.content_map, path);
	}
	selector() {
		return this.path;
	}


	/*=======================TEST=======================*/
	save() {
		//@NOTE : bullshit above

		var path = this.selector().traverse();
		var atom_data;
		var result = [];

		for(atom_data of path) {
			var {
				atom_path: atom_path,
				atom: atom
			} = atom_data;

			let status = this.parent.getAtom(atom_path).save(atom, true);

			result.push(status);
		}

		return result;
	}
	getSourceAtom(atom) {
		return !atom.source_atom ? atom : this.getSourceAtom(atom.source_atom)
	}
	observe() {
		let atom_data;
		let observed_atoms = [];
		for(atom_data of this.path) {
			let {
				atom_path: atom_path,
				atom: atom
			} = atom_data;

			let params = this.path.getQueryParams();
			let observed_atom = {
				atom_path: Promise.all(atom_path),
				atom: atom.observe(params)
			};
			observed_atoms.push(Promise.props(observed_atom));
		}
		return Promise.all(observed_atoms)
			.then((res) => {
				console.log("OBSERVED ATOM", res);
				_.map(res, (resolved_atom) => {
					this.addAtom(resolved_atom.atom_path, resolved_atom.atom);
				});
				return this;
			});
	}
	reserve() {
		var atom_data;

		for(atom_data of this.path) {
			var {
				atom_path: atom_path,
				atom: atom
			} = atom_data;

			var params = this.path.getQueryParams();

			var after_reserve = atom.reserve(params);

			if(after_reserve) this.addAtom(atom_path, after_reserve);
		}

		return this;
	}
	reset() {
		var path = this.selector().traverse();
		var atom_data;

		for(atom_data of path) {
			var {
				atom_path: atom_path,
				atom: atom
			} = atom_data;

			if(atom.parent) this.addAtom(atom_path, atom.parent);
		}

		return this;
	}

	/*=======================TEST=======================*/

}

module.exports = ResolvedContentAsync;