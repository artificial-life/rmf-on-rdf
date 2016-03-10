'use strict'

//utility
let base_dir = "../../../";

//parent
let CommonApi = require("./CommonApi");

let default_org_structure = 'global_org_structure';

class WorkstationApi extends CommonApi {
	constructor(cfg = {}) {
		let config = _.merge({
			org_structure: default_org_structure
		}, cfg);
		super({
			startpoint: config
		});
	}

	initContent() {
		super.initContent('Workstation');
		super.initContent('Terminal');
		super.initContent('Roomdisplay');
		super.initContent('Qa');
		super.initContent('Administrator');

		super.initContent('Organization');
		super.initContent('Schedule');

		return this;
	}

	getOrganizationTree() {
		return this.db.get(this.startpoint.org_structure)
			.then((res) => (res.value || {}))
			.catch((err) => {});
	}

	getWorkstationOrganizationChain(org_key) {
		if (!org_key) return {};
		let org_keys = _.uniq(_.castArray(org_key));
		let orgs = {};
		let paths = {};
		return this.getOrganizationTree()
			.then((orgtree) => {
				let Organization = this.models["Organization"];
				let recurse = (tree, path = []) => {
					_.map(tree.has_unit, (node, index) => {
						path.push(`has_unit.${index}`);
						let k = _.join(path, '.');
						let mod = new Organization();
						mod.build(node);
						orgs[k] = mod.serialize();
						paths[k] = ({
							path,
							id: orgs[k].id
						});

						if (_.isArray(node.has_unit) || _.isPlainObject(node.has_unit)) {
							return recurse(node, _.clone(path));
						} else {
							return paths;
						}
					});
				};
				recurse(orgtree);
				return _.reduce(org_keys, (acc, key) => {
					let org = _.find(_.values(paths), ({
						path,
						id
					}) => {
						return id == key;
					});
					acc[key] = {};
					let p = _.clone(org.path);
					let level = 0;
					while (!_.isEmpty(p)) {
						acc[key][level] = orgs[_.join(p, ".")];
						_.unset(acc[key][level], 'has_unit');
						p = _.dropRight(p);
						level++;
					}
					return acc;
				}, {});
			})
			.catch((err) => {
				console.log("WSOD ERR", err.stack);
			});
	}

	getWorkstationOrganizationSchedulesChain(org_key) {
		let prov;
		let time = process.hrtime();

		return this.getWorkstationOrganizationChain(org_key)
			.then((res) => {
				prov = res;
				let keys = _.flatMap(_.values(prov), (p, key) => {
					return _.flatMap(_.values(p), (org) => _.values(org.has_schedule));
				});
				keys = _.uniq(keys);
				return super.getEntry("Schedule", {
					keys
				});
			})
			.then((res) => {
				return _.mapValues(prov, (p, key) => {
					return _.mapValues(p, (org) => {
						org.has_schedule = _.mapValues(org.has_schedule, (schedules) => _.values(_.pick(res, schedules)));
						return org;
					})
				});
				let diff = process.hrtime(time);
				console.log(' WOSD took %d nanoseconds', diff[0] * 1e9 + diff[1]);
				return result;
			});
	}

	getWorkstation(query) {
		let type = query.keys ? false : 'Workstation';
		return super.getEntry(type, query);
	}
	setWorkstationField(query, assignment, concat = true) {
		let type = query.keys ? false : 'Workstation';

		return super.setEntryField(type, query, assignment, concat);
	}
	setWorkstation(data) {
		return super.setEntry('Workstation', data);
	}
}

module.exports = WorkstationApi;
