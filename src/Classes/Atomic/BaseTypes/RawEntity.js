'use strict'

var ProxifyEntity = require('../../../externals/Proxify/Entity.js');

let discover = (name) => {
	try {
		return require(`./${name}.js`);
	} catch(e) {
		return require("./Fieldset.js");
	}
}

class RawEntity {
	constructor(entity_type) {
		//@TODO implement translator
		this.entity_type = entity_type;
		this.content = {};
		if(this.constructor.name == 'RawEntity') return ProxifyEntity(this);
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
			content_map.id = db_data['@id'];
			//@TODO use it wisely
			content_map.type = db_data['@type'];

			_.map(entity.fields, (key) => {
				if(_.isUndefined(db_data[key])) return;
				content_map[key] = _.size(db_data[key]) == 1 ? db_data[key][0] : db_data[key];
			});
		} else {
			content_map = data;
			content_map.type = data.type || data['@type'] || this.entity_type.name;
			content_map.id = data.id || data['@id'];
		}
		// console.log("RE CM", content_map, data);
		this.content = entity.build(content_map) || entity;
	}

	serialize() {
		let data = this.content.serialize();
		data.cas = this.content.cas;
		data.class = this.entity_type.name;
		return data;
	}

	transformKeys() {
		let data = this.serialize();
		let db_data = _.reduce(data, (acc, val, key) => {
			if(key == 'id') {
				acc['@id'] = val;
			} else if(key == 'type') {
				acc['@type'] = val || data.class;
			} else if(key == 'cas') {
				acc.cas = val;
			} else if(!_.includes(['class'], key)) {
				acc[key] = val;
			}
			return acc;
		}, {});
		// console.log("KT", db_data);
		return db_data;
	}


	dbSerialize() {
		let db_data = this.transformKeys();
		_.map(db_data, (val, key) => {
			if(!_.startsWith(key, "@") && key !== 'cas') {
				db_data[key] = _.isArray(db_data[key]) ? db_data[key] : [db_data[key]];
			}
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

	observe() {
		return this;
	}

}

module.exports = RawEntity;