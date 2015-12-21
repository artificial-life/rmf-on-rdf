'use strict'

class KeymakerUtil {
	static flatten_ld(data) {
		return _.pluck(_.flattenDeep(data), '@id');
	}

	static key_typecast(key, opt) {
		let re = new RegExp("(.*)#([^-]*)-([^\/]*)");
		return key.replace(re, (str, oprefix, otype, oid) => {
			return `${(opt.prefix|| oprefix)}#${(opt.type|| otype)}-${(opt.id || oid)}`;
		});
	}
}

module.exports = KeymakerUtil;