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
		if (query) {
			switch (query.type) {
			case 'n1ql':
				return this.process_query(query, options);
				break;
			case 'chain':
				return this.process_chain(query, options);
				break;
			default:
				return {};
				break;
			}
		}
		return this._bucket.getNodes(keys, options);
	}

	getNodes(compound_key, options) {
		let p = {};
		let flatten = (obj) => {
			if (_.isArray(obj) || _.isString(obj)) {
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

	process_chain(q, options) {
		return Promise.reduce(q.query, (acc, query, index) => {
				let keys = query.in_keys || query.out_keys(acc[index - 1].nodes);
				return this._bucket.getNodes(keys, options)
					.then((nodes) => {
						// console.log("NODES", index, nodes);
						acc[index] = {
							name: query.name,
							nodes
						};
						return acc;
					});
			}, [])
			.then((res) => {
				let out = _.mapValues(_.keyBy(res, 'name'), (t) => _.values(t.nodes));
				return _.isFunction(q.final) ? q.final(out) : out;
			});
	}

	process_query(q, options) {
		let promises = _.mapValues(q.query, (query, qkey) => {
			let params = query.params || [];
			if (query.direct)
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
				let fin_keys = _.isFunction(q.final) ? q.final(res) : res;
				return q.forward ? fin_keys : this.getNodes(fin_keys, options);
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
