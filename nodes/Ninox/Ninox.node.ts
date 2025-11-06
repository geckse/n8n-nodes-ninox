import {
	type INodeType,
	type INodeTypeDescription,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { v1Operations, v1Parameters } from './v1';
import { v2Operations, v2Parameters } from './v2';
import { sharedParameters } from './shared';
import { listSearch, loadOptions, resourceMapping } from './methods';

export class Ninox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ninox',
		name: 'ninox',
		icon: 'file:ninox.svg',
		group: ['input'],
		version: [1, 2],
		subtitle: '={{$parameter["operation"]}}',
		description: 'Read, create, update and delete data from Ninox',
		defaults: {
			name: 'Ninox',
			color: '#4970FF',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		codex: {
			categories: ['Database', 'Ninox'],
			resources: {
				primaryDocumentation: [
					{
						url: 'https://github.com/geckse/n8n-nodes-ninox',
					},
					{
						url: 'https://docs.ninox.com/api/rest-api',
					},
				],
			},
		},
		credentials: [
			{
				name: 'ninoxApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{ !$credentials.customBaseUrl ? "https://api.ninox.com/v1" : $credentials.baseUrl.replace(new RegExp("/$"), "")}}',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},

		/**
		 * Main Resources and Operations for Ninox
		 */
		properties: [
			// v2 Resource parameter (must be first for v2)
			...v2Parameters.filter(p => p.name === 'resource'),

			// ----------------------------------
			//         Operations
			// ----------------------------------
			// v1 Operation parameter
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: v1Operations,
				default: 'list',
				displayOptions: {
					show: {
						'@version': [1],
					},
				},
			},
			// v2 Operation parameter
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: v2Operations,
				default: 'list',
				displayOptions: {
					show: {
						'@version': [2],
					},
				},
			},

			// ----------------------------------
			//         Shared Parameters (Team, Database, Table, Script)
			// ----------------------------------
			...sharedParameters.filter(p =>
				['teamId', 'databaseId', 'tableId', 'script'].includes(p.name)
			),

			// ----------------------------------
			//         Version-specific Parameters
			// ----------------------------------
			// v1 parameters (recordId, file params, field mapping)
			...v1Parameters,
			// v2 parameters (recordId, file params, field mapping) - exclude resource since it's already added
			...v2Parameters.filter(p => p.name !== 'resource'),

			// ----------------------------------
			//         v1 Pagination Parameters from shared
			// ----------------------------------
			...sharedParameters.filter(p =>
				['returnAll', 'page', 'limit'].includes(p.name)
			),
		],
	};

	methods = {
		listSearch,
		loadOptions,
		resourceMapping,
	};
}