'use strict'

let BasicValidator = require("./Validator/BasicValidator");

class Determinable {
	constructor(fields, validator_model = BasicValidator) {
		this.content_map = _.reduce(fields, (acc, field) => {
			acc[field] = undefined;
			return acc;
		}, {});
		this.validator = new BasicValidator(this.content_map);
		//@TODO implement translator
		this.setKeyTransform((key) => key);
	}

	get fields() {
		return _.keys(this.content_map);
	}

	valid() {
		return this.validator.validate();
	}

	invalidate(fieldname) {
		if(this.content_map[fieldname])
			this.content_map[fieldname] = undefined;
	}

	setKeyTransform(fn) {
		this.key_transformer = fn;
	}

	keyTransform(key) {
		return this.key_transformer(key);
	}

	build(data) {
		if(data.value) {
			//construct from db
			this.cas = data.cas;
			//meh
			let db_data = data.value;
			this.content_map.id = _.last(db_data['@id'].split("#"));

			_.map(this.fields, (property) => {
				let key = this.keyTransform(property);
				if(!_.isUndefined(db_data[key])) {
					let db_val = _.isArray(db_data[key]) ? db_data[key] : [db_data[key]];
					let val = _.map(db_val, (piece) => {
						if(!_.isObject(piece)) return piece;
						return piece['@id'] || piece['@value'];
					})
					this.content_map[property] = (val.length == 1) ? val[0] : val;
				}
			});
		} else {
			_.map(this.fields, (property) => {
				if(!_.isUndefined(data[property]))
					this.content_map[property] = data[property];
			});
		}
	}

	serialize() {
		let data = {};
		_.merge(data, this.content_map);
		data.cas = this.cas;
		return data;
	}

	dbSerialize() {
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
		db_data['@type'] = "iris://vocabulary/domain#" + this.constructor.name;

		return db_data;
	}

	getAsQuery() {
		let data = this.dbSerialize();
		return _.reduce(data, (acc, val, key) => {
			if(!_.isUndefined(val)) acc[key] = val;
			return acc;
		}, {});
	}
}

module.exports = Determinable;