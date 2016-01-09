'use strict'

var ProxifyEntity = require('../../../externals/Proxify/Entity.js');

class LDEntity {
	constructor(entity_type, translator_fn) {
		//@TODO implement translator
		let translator = _.isFunction(translator_fn) ? translator_fn : (key) => key;
		this.setKeyTransform(translator_fn);
		this.entity_type = entity_type;
		if(this.constructor.name == 'LDEntity') return ProxifyEntity(this);
	}
	setKeyTransform(fn) {
		this.key_transformer = fn;
	}

	keyTransform(key) {
		return this.key_transformer(key);
	}

	build(data) {
		let Model = this.entity_type;
		let entity = new Model();
		let content_map = {};
		if(data.value) {
			//construct from db
			entity.cas = data.cas;
			//meh
			let db_data = data.value;
			content_map.id = _.last(db_data['@id'].split("#"));

			_.map(entity.fields, (property) => {
				let key = this.keyTransform(property);
				if(!_.isUndefined(db_data[key])) {
					let db_val = _.isArray(db_data[key]) ? db_data[key] : [db_data[key]];
					let val = _.map(db_val, (piece) => {
						if(!_.isObject(piece)) return piece;
						return piece['@id'] || piece['@value'];
					})
					content_map[property] = (val.length == 1) ? val[0] : val;
				}
			});
		} else {
			content_map = data;
		}
		entity.build(content_map);
		this.content = entity;
	}

	serialize() {
		let data = this.content.serialize();
		data.cas = this.content.cas;
		return data;
	}

	transformKeys() {
		let data = this.serialize();
		let db_data = _.reduce(data, (acc, val, key) => {
			if(key == 'id') {
				acc['@id'] = "iris://data#" + val;
			} else if(key == 'cas') {
				acc.cas = val;
			} else {
				let nkey = this.keyTransform(key);
				acc[nkey] = val;
			}
			return acc;
		}, {});
		db_data['@type'] = "iris://vocabulary/domain#" + this.entity_type.name;
		return db_data;
	}
	dbSerialize() {
		let db_data = this.transformKeys();

		let refs = this.content.references;
		_.map(refs, (ref) => {
			let key = this.keyTransform(ref);
			let ref_val = _.isArray(db_data[key]) ? db_data[key] : [db_data[key]];
			let value = _.map(ref_val, (val) => {
				return _.isUndefined(val) ? false : {
					'@id': val
				};
			});
			db_data[key] = _.compact(value);
		})
		return _.isFunction(this.content.dbSerialize) ? this.content.dbSerialize(db_data) : db_data;
	}


	getAsQuery() {
		let data = this.transformKeys();
		let db_data = _.reduce(data, (acc, val, key) => {
			if(!_.isUndefined(val)) acc[key] = val;
			return acc;
		}, {});
		return _.isFunction(this.content.getAsQuery) ? this.content.getAsQuery(db_data) : db_data;
	}
}

module.exports = LDEntity;