'use strict'

let AbstractDataProvider = require('./AbstractDataProvider.js');

class CouchbirdDataProvider extends AbstractDataProvider {
	constructor(bucket) {
		super();
		this._bucket = bucket;
	}

	get({
		keys,
		query,
		options
	}) {
		if(query) {
			return this.process_query(query, options);
		}
		return this._bucket.getNodes(keys, options);
	}

	getNodes(compound_key, options) {
		let p = {};
		let flatten = (obj) => {
			if(_.isArray(obj) || _.isString(obj)) {
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

	process_query(q, options) {
		let promises = _.mapValues(q.query, (query, qkey) => {
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
				let fin_keys = _.isFunction(keys.final) ? keys.final(res) : res;
				return keys.forward ? fin_keys : this.getNodes(fin_keys, options);
			});
	}

	set(values, options) {
		return this._bucket.replaceNodes(values, options);
	}

	upsert(values, options) {
		return this._bucket.upsertNodes(values, options);
	}

	//DESTROY
	remove(keys, options) {
		return this._bucket.removeNodes(keys, options);
	}
}

module.exports = CouchbirdDataProvider;