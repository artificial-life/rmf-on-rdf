'use strict'

let AbstractDataProvider = require('./AbstractDataProvider.js');

class CouchbirdLinkedDataProvider extends AbstractDataProvider {
	constructor(bucket) {
		super();
		this._bucket = bucket;
	}
	get(keys, options) {
		//dirty hack
		if(keys.length == 1 && keys[0].query) {
			return this.process_query(keys[0], options);
		}
		return this._bucket.getNodes(keys, options);
	}

	process_query(keys, options) {
			let promises = {};
			_.map(keys.query, (query, qkey) => {
				if(query.where) {
					//N1ql hook
					//'@id' not here, so query id's if you want id's
					let obj = query.where['@type'] || _.values(query.where)[0];
					let pre = query.where['@type'] ? '@type' : false;
					promises[qkey] = this._bucket.N1ql.byTriple({
							// out while n1ql is so picky
							// select: query.select || "*",
							subject: false,
							predicate: pre,
							object: obj
						})
						.then((res) => {
							//@TODO: remove it when select is working
							let filtered = _.filter(res, (doc) => {
								_.forEach(query.where, (val, key) => {
									if((!_.eq(doc[key], val)) && (!~_.indexOf(doc[key], val)) && (!_.find(doc[key], {
											'@id': val
										}))) {
										return false;
									}
								});
								return true;
							});

							return filtered;
						});
				} else {
					//nowhere
					promises[qkey] = this._bucket.N1ql.byTriple({
						// out while n1ql is so picky
						// select: query.select || "*",
						subject: false,
						predicate: query.select || "*",
						object: false
					});
				}
				promises[qkey] = promises[qkey]
					.then((filtered) => {
						let selected = (query.select == "*") ? filtered : _.pluck(filtered, query.select);
						return _.isFunction(query.transform) ? query.transform(selected) : selected;
					});
			});
			return Promise.props(promises)
				.then((res) => {
					//order and test it here
					let order = keys.order || _.keys(keys.query);
					let result = {};
					_.forEach(order, (qkey) => {
						let data = res[qkey];
						let test = keys.query[qkey].test;
						result[qkey] = _.filter(data, (item) => {
							return _.isFunction(test) ? test(item, result) : true;
						});
					});

					let fin_keys = _.isFunction(keys.final) ? keys.final(result) : result;
					return this._bucket.getNodes(fin_keys, options);
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