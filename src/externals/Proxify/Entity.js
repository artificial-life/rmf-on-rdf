'use strict'

//@TODO: remove it when proxies come to live
var Reflect = require('harmony-reflect');

function ProxifyEntity(entity) {
	if(!entity) throw new Error('Need an entity to proxify.');

	let handler = {
		get(target, propKey, receiver) {
			if(propKey === 'constructor') return target.constructor;
			if(target.hasOwnProperty(propKey)) return target[propKey];
			//@NOTE: hack for console.log
			if(propKey == 'inspect') return function(depth) {
				return target;
			};

			// promises hack
			if(propKey == 'then')
				return target.then;

			return function(...args) {
				// console.log("PROXY", propKey, target, args);
				const origMethod = target[propKey];
				if(!origMethod) throw new Error('No such method in entity proxy: "' + propKey + '"');
				// if(!origMethod && _.isFunction(target.entityMethod))
				// 	return target.entityMethod(propKey, args);
				return origMethod.apply(this, args);
			}
		}
	};

	return new Proxy(entity, handler);
}

module.exports = ProxifyEntity;