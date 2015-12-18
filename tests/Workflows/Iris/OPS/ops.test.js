'use strict'

var _ = require('lodash');
var uuid = require('node-uuid');

var Content = require(_base + '/build/Classes/Content.js');
var BasicAccessor = require(_base + '/build/Classes/Atomic/Accessor/BasicAccessor.js');
var FactoryDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/FactoryDataProvider.js');
var IngredientDataProvider = require(_base + '/build/Classes/Atomic/DataProvider/IngredientDataProvider.js');
var ResourceFactory = require(_base + '/build/Classes/ResourceFactory.js');

var HashmapDataProvider = require(_base + '/build/externals/HashmapDataProvider.js');
var AtomicFactory = require(_base + '/build/Classes/Atomic/AtomicFactory.js');

var TEST_STORAGE = require(_base + '/build/externals/TESTSTORAGE.js');

describe('Operators Collection', () => {
	let OPS;
	beforeEach(() => {
		if(true) {
			TEST_STORAGE.operator1_plan = [{
				data: [
					[0, 100]
				],
				state: 'a'
			}, {
				data: [
					[200, 400]
				],
				state: 'a'
			}];
			TEST_STORAGE.operator2_plan = [{
				data: [
					[0, 200]
				],
				state: 'a'
			}, {
				data: [
					[300, 400]
				],
				state: 'a'
			}];
			TEST_STORAGE.operator3_plan = [{
				data: [
					[0, 100]
				],
				state: 'a'
			}];
			TEST_STORAGE.service1_plan_data = [{
				data: [
					[0, 100]
				],
				state: 'a'
			}];
			TEST_STORAGE.service2_plan_data = [{
				data: [
					[100, 1000]
				],
				state: 'a'
			}];

			TEST_STORAGE.operator1_services = {
				service1: TEST_STORAGE.service1_plan_data,
				service2: TEST_STORAGE.service2_plan_data
			};

			TEST_STORAGE.operator2_services = {
				service1: TEST_STORAGE.service1_plan_data
			};

			TEST_STORAGE.operator3_services = {
				service2: TEST_STORAGE.service2_plan_data
			};

		}

		let provider = new HashmapDataProvider();
		let ops_plan_accessor = new BasicAccessor(provider);

		ops_plan_accessor.keymaker('get', function(p) {
			if(p.id == '*') {
				return ['operator1_plan', 'operator2_plan', 'operator3_plan'];
			}
			let ids = _.isArray(p.id) ? p.id : [p.id];
			return _.map(ids, (id) => 'operator' + id + '_plan');
		});

		OPS = new Content();

		let datamodel = {
			type: 'Plan',
			deco: 'BaseCollection'
		};

		let plan_collection = AtomicFactory.create('Basic', {
			type: datamodel,
			accessor: ops_plan_accessor
		});

		OPS.addAtom(plan_collection, 'plan');

		let attributes_services_datamodel = {
			type: {
				type: 'Plan',
				deco: 'BaseCollection'
			},
			deco: 'BaseCollection'
		};

		let services_accesor = new BasicAccessor(provider);
		services_accesor.keymaker('get', (query) => {
			let operator_id = query.id;
			let service_id = query.selection.id;

			if(operator_id == '*') {
				return ['operator1_services', 'operator2_services', 'operator3_services'];
			}
		});

		let operator_services_collection = AtomicFactory.create('Basic', {
			type: attributes_services_datamodel,
			accessor: services_accesor
		});

		OPS.addAtom(operator_services_collection, 'services', '<namespace>attribute');
	});

	describe('test OPS', () => {
		it('observe all', () => {
			OPS.selector().reset().add()
				.id('<namespace>content').id('plan').query({
					id: '*'
				});

			OPS.selector().add()
				.id('<namespace>attribute').id('services').query({
					id: '*',
					selection: {
						id: '*'
					}
				});

			let resolved_ops = OPS.resolve();

			let services = resolved_ops.getAtom(['<namespace>attribute', 'services']);
			let observed = services.observe({
				id: 'operator1_services',
				selection: {
					id: '*'
				}
			});

			_.forEach(observed.content.operator1_services.content, (item, name) => {
				console.log(name, item)
			});
		});
	});
});