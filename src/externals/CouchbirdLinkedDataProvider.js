'use strict'

let AbstractDataProvider = require('./AbstractDataProvider.js');

class CouchbirdLinkedDataProvider extends AbstractDataProvider {
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
		if(query) {
			return this.process_query(query, options);
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

		p = flatten(compound_key);

		return p;
	}
	process_query(keys, options) {
			let promises = {};
			_.map(keys.query, (query, qkey) => {
				if(!query)
					return false;
				if(_.isArray(query)) {
					promises[qkey] = query;
					return true;
				}
				if(query.where) {
					//N1ql hook
					//'@id' not here, so query id's if you want id's
					let obj = query.where['@type'] || _.values(query.where)[0];
					let pre = query.where['@type'] ? '@type' : false;
					promises[qkey] = this._bucket.N1ql.byTriple({
							subject: false,
							predicate: pre,
							object: obj
						})
						.then((res) => {
							let filtered = _.filter(res, (doc) => {
								for(let key in query.where) {
									let value = query.where[key];
									let valmap = _.isArray(value) ? value : [value];
									if(value == '*')
										continue;
									let res = _.filter(valmap, (val) => {
										if((!_.eq(doc[key], val)) && !~_.indexOf(doc[key], val) && (!_.find(doc[key], {
												'@id': val
											})) && (!_.find(doc[key], {
												'@value': val
											}))) {
											return false;
										}
										return true;
									});
									// console.log("AAAA", valmap, res, key);
									if(!res.length)
										return false;
								}
								return true;
							});
							return filtered;
						});
				} else {
					//nowhere
					promises[qkey] = this._bucket.N1ql.byTriple({
						subject: false,
						predicate: query.select || "*",
						object: false
					});
				}
			});

			return Promise.props(promises)
				.then((res) => {
					//order and test it here
					let order = keys.order || _.keys(keys.query);
					let result = {};
					_.forEach(order, (qkey) => {
						let query = keys.query[qkey];
						let data = res[qkey];
						let test = query.test;
						result[qkey] = _.filter(data, (item) => {
							return _.isFunction(test) ? test(item, result) : true;
						});

						let selected = (!query.select || (query.select == "*")) ? result[qkey] : _.map(result[qkey], query.select);
						result[qkey] = _.isFunction(query.transform) ? query.transform(selected) : selected;
					});

					let fin_keys = _.isFunction(keys.final) ? keys.final(result) : result;
					return this.getNodes(fin_keys, options);
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

module.exports = CouchbirdLinkedDataProvider;