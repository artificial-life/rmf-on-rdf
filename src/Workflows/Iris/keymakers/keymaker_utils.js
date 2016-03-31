'use strict'

class KeymakerUtil {

	static key_typecast(key, opt) {
		let re = new RegExp("([^-]*)-([^\/]*)");
		let cast_type = _.isFunction(opt.type) ? opt.type : (type) => {
			return opt.type || type;
		}
		let cast_id = _.isFunction(opt.id) ? opt.id : (id) => {
			return opt.id || id;
		}
		return key.replace(re, (str, otype, oid) => {
			return `${(cast_type(otype))}-${(cast_id(oid))}`;
		});
	}
}

module.exports = KeymakerUtil;