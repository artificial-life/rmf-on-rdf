'use_strict'

let IrisBuilder = require("./Builder");
let IrisApi = require("./IrisApi");

//temporary here
//@TODO make all this bullshit in a righteous way
class BookingApi extends IrisApi {
	constructor() {
		super();
	}
	initContent() {
		IrisBuilder.init(this.db, {
			default_slot_size: 15 * 3600
		});
		let rs = IrisBuilder.getResourceSource();
		this.factory = IrisBuilder.getFactory({
			'ldplan': rs
		});
		this.user_info = IrisBuilder.getUserInfoStorage();
	}

	build(query, factory_params = {}) {
		this.factory.selector().reset()
			.add()
			.id('<namespace>builder').id('box').query(query);
		return this.factory.build(factory_params);
	}

	observe(query, factory_params = {}) {
		return this.build(query, factory_params)
			.then((produced) => {
				return produced.observe({
					box_id: query.box_id || '*'
				});
			})
			.then((res) => {
				return res.getAtom(['<namespace>builder', 'box']).serialize();
			});
	}

	reserve(data) {
		return this.factory.getAtom(['<namespace>builder', 'box']).save(data);
	}

	getUserInfo(data) {
		return this.user_info.resolve(data)
			.then((res) => {
				return res.getAtom(['<namespace>content', 'user_info']).serialize();
			});
	}
	setUserInfo(data) {
		return this.user_info.getAtom(['<namespace>content', 'user_info']).save(data);
	}
}
module.exports = BookingApi;