'use strict'

//utility
let base_dir = "../../../";

//parent
let CommonApi = require("./CommonApi");

let default_org_structure = 'global_org_structure';

class WorkstationApi extends CommonApi {
	constructor(cfg = {}) {
		super();
		let config = _.merge({
			org_structure: default_org_structure
		}, cfg);
		this.org_structure = config.org_structure;
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
		return this.db.get(this.org_structure)
			.then((res) => (res.value || {}))
			.catch((err) => {});
	}

	getWorkstationOrganizationChain(org_key) {
		if (!org_key) return {};
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

						if (_.isArray(node.has_unit) || _.isPlainObject(node.has_unit))
							return recurse(node, _.clone(path));
						else return paths;
					});
				};
				recurse(orgtree);
				let org = _.find(_.values(paths), ({
					path,
					id
				}) => {
					return id == org_key;
				});
				let acc = {};
				let p = _.clone(org.path);
				let level = 0;
				while (!_.isEmpty(p)) {
					acc[level] = orgs[_.join(p, ".")];
					_.unset(acc[level], 'has_unit');
					p = _.dropRight(p);
					level++;
				}
				return acc;
			})
			.catch((err) => {
				console.log("WSOD ERR", err.stack);
			});
	}

	getWorkstationOrganizationSchedulesChain(query) {
		let prov;
		let time = process.hrtime();

		return this.getWorkstationOrganizationChain(query)
			.then((res) => {
				prov = res;
				let keys = _.flatMap(prov, (prov, key) => {
					return _.values(prov.has_schedule);
				});
				keys = _.uniq(keys);
				return super.getEntry("Schedule", {
					keys
				});
			})
			.then((res) => {
				return _.mapValues(prov, (p, key) => {
					p.has_schedule = _.mapValues(p.has_schedule, (schedules) => _.values(_.pick(res, schedules)));
					return p;
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
