'use strict'

var _ = require('lodash');

var TimeChunk = require('./Primitive/TimeChunk.js');
var Plan = require('./Plan.js');
var ZeroDimensional = require('./ZeroDimensionalVolume.js');

class LDPlan extends Plan {
	constructor(parent) {
		super(parent);
		this.PrimitiveVolume = TimeChunk;
	}
	build(data) {
		let build_data = data || [{
			data: [
				[0, 0]
			]
		}];
		if(_.isArray(data) && data.length && (data[0].value || data[0]['@id'])) {
			//resolver
			//only first plan right now
			//expecting that there is only one plan due to query
			let item = data[0];
			build_data = item['iris://vocabulary/domain#hasTimeDescription'];
			if(item.cas) {
				this.cas = item.cas;
				item = item.value;
				build_data = item['iris://vocabulary/domain#hasTimeDescription'][0]['@value'];
				build_data = JSON.parse(build_data);
			}
			// this.plan_of = (item["iris://vocabulary/domain#planOf"] || item["iris://vocabulary/domain#scheduleOf"])[0]['@id'];
			this.db_data = item;
		}
		super.build(build_data);
	}

	serialize() {
		let data = super.serialize();
		if(this.db_data) {
			data.db_data = this.db_data;
			data.cas = this.cas;
		}
		return data;
	}

	free(params) {
		//@NOTE: proxy to parent if it exists
		let target = this.parent ? this.parent : this;

		if(!params) {
			//@NOTE: free all
			let status = true;
			let content = this.getContent();
			let result = [];
			for(let i in content) {
				let placed = target.put({
					data: content[i].serialize().data,
					state: 'a'
				});
				if(!placed) {
					status = false;
					break;
				}
				result.push(placed);
			}
			if(status)
				this.stored_changes = this.stored_changes.concat(result);

			return status ? target : false;
		}

		let placed = target.put({
			data: params,
			state: 'a'
		});

		if(placed) {
			this.stored_changes.push(placed);
		}

		return placed ? target : false;
	}
}

module.exports = LDPlan;