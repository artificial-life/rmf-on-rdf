'use strict'

let AbstractDataProvider = require('./AbstractDataProvider.js');

class CouchbirdDataProvider extends AbstractDataProvider {
	constructor(bucket) {
		super();
		this._bucket = bucket;
	}

	get({
		keys: keys,
		query: query,
		options: options
	}) {
		//dirty hack
		if(query && query.type == 'view') {
			return this.process_query(query, options);
		}
		if(query && query.type == 'chain') {
			return this.process_chain(query, options);
		}
		return this._bucket.getNodes(keys, options);
	}

	getNodes(compound_key, options) {
		let p = {};
		//@TODO change this later. It's outrageous
		let flatten = (obj) => {
			if(_.isArray(obj) || _.isString(obj)) {
				//arrays are allowed only for string keys
				return this._bucket.getNodes(obj, options);
			} else {
				return Promise.props(_.reduce(obj, (acc, val, k) => {
					acc[k] = flatten(val);
					return acc;
				}, {}));
			}
		};

		let k = compound_key.templates ? compound_key.keys : compound_key;
		p = flatten(k);

		// console.log("CMP", compound_key, k);
		return compound_key.templates ? Promise.props({
			keys: p,
			templates: compound_key.templates
		}) : p;
	}

	process_chain(keys, options) {
		let p = Promise.resolve([]);
		let fin = {};
		_.map(keys.query, (query, key) => {
			p.then((pre) => {
					return this._bucket.getNodes(query.keys(pre));
				})
				.then((res) => {
					fin[key] = res;
					return res;
				});
		});
		return this.getNodes(keys.finalize(fin), options);
	}

	process_query(keys, options) {
			let promises = _.mapValues(keys.query, (query, qkey) => {
				if(!query)
					return false;
				if(_.isArray(query)) {
					return query;
				}
				let params = query.params || [];
				if(query.direct)
					return this._bucket.N1ql.direct({
						query: query.direct,
						params
					});
				let select = query.select || '*';
				let where = query.where || '';
				return this._bucket.N1ql.query({
					select,
					query: where,
					params
				});
			});

			return Promise.props(promises)
				.then((res) => {
					//order and test it here
					let fin_keys = _.isFunction(keys.final) ? keys.final(res) : res;
					return keys.forward ? fin_keys : this.getNodes(fin_keys, options);
				});
		}
		//TODO: Interpreter stage
	set(values, options) {
		return this._bucket.replaceNodes(values, options);
		// .then((res) => {
		// 	return res[key];
		// });
	}

	//TODO: Interpreter stage
	upsert(values, options) {
		return this._bucket.upsertNodes(values, options);
		// .then((res) => {
		// 	return res[key];
		// });
	}

	//DESTROY
	remove(keys, options) {
		return this._bucket.removeNodes(keys, options);
		// .then((res) => {
		// 	return res[key];
		// });
	}
}

module.exports = CouchbirdDataProvider;