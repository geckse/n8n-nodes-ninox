import { INodeProperties } from 'n8n-workflow';

export const sharedParameters: INodeProperties[] = [
	// ----------------------------------
	//         Team, Database, Table
	// ----------------------------------
	{
		displayName: 'Ninox Team',
		name: 'teamId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		placeholder: '',
		required: true,
		description: 'The ID of the team to access. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		modes: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				hint: 'Enter an ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[a-zA-Z0-9_]*$',
							errorMessage: 'The ID must be alphanumeric',
						},
					},
				],
				placeholder: 'ub5u88eb4b13',
				url: '=teams/{{$value}}',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				hint: 'Enter a Ninox URL',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '(?:https|http):\/\/app\.ninox\.com\/#\/teams\/[a-zA-Z0-9]{2,}.*',
							errorMessage: 'Not a valid Ninox URL',
						},
					},
				],
				placeholder: 'https://app.ninox.com/#/teams/voiNdnWLGJ6f3Y4ar/database/ub5u88eb4b13/module/A',
				extractValue: {
					type: 'regex',
					regex: '(?:https|http):\/\/app\.ninox\.com\/#\/teams\/([a-zA-Z0-9]{2,}).*',
				},
			},
			{
				displayName: 'List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTeams',
					searchable: true
				}
			}
		],
	},
	{
		displayName: 'Ninox Database',
		name: 'databaseId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		placeholder: '',
		required: true,
		description: 'The ID of the database to access. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			hide: {
				teamId: [''],
			},
		},
		modes: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				hint: 'Enter an ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[a-zA-Z0-9_]*$',
							errorMessage: 'The ID must be alphanumeric',
						},
					},
				],
				placeholder: 'ub5u88eb4b13',
				url: '=teams/{{$parameter.teamId}}/databases/{{$value}}',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				hint: 'Enter a Ninox URL',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '(?:https|http)://app.ninox.com/#/teams/([a-zA-Z0-9]{2,})/databases/([a-zA-Z0-9]{2,}).*',
							errorMessage: 'Not a valid Ninox URL',
						},
					},
				],
				placeholder: 'https://app.ninox.com/#/teams/voiNdnWLGJ6f3Y4ar/database/ub5u88eb4b13/module/A',
				extractValue: {
					type: 'regex',
					regex: 'app.ninox\.com\/\#\/teams\/[a-zA-Z0-9]*.*\/databases/([a-zA-Z0-9]*.*).*',
				},
			},
			{
				displayName: 'List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getDatabases',
					searchable: true
				}
			}
		],
	},
	{
		displayName: 'Ninox Table',
		name: 'tableId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		placeholder: '',
		required: true,
		displayOptions: {
			hide: {
				teamId: [''],
				databaseId: [''],
				operation: ['ninoxScript', 'getDatabaseSchema', 'getTablesSchema'],
			},
		},
		modes: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				hint: 'Enter an ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[a-zA-Z0-9_]*$',
							errorMessage: 'The ID must be alphanumeric',
						},
					},
				],
				placeholder: 'A',
				url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$value}}',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				hint: 'Enter a Ninox URL',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: 'http(s)?://app.ninox.com/#/teams/([a-zA-Z0-9]{2,})/databases/([a-zA-Z0-9]{2,})/tables/([a-zA-Z0-9]{1,}).*',
							errorMessage: 'Not a valid Ninox URL',
						},
					},
				],
				placeholder: 'https://app.ninox.com/#/teams/voiNdnWLGJ6f3Y4ar/database/ub5u88eb4b13/module/A',
				extractValue: {
					type: 'regex',
					regex: 'app.ninox\.com\/\#\/teams\/[a-zA-Z0-9]*.*\/database/[a-zA-Z0-9]*.*\/module/([a-zA-Z0-9]*.*).*',
				},
			},
			{
				displayName: 'List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTables',
					searchable: true
				}
			}
		],
		description: 'The ID of the table to access. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},

	// ----------------------------------
	//         Ninox Script Parameter (shared for both v1 and v2)
	// ----------------------------------
	{
		displayName: 'Ninox Script',
		name: 'script',
		type: 'string',
		default: '',
		placeholder: "(select contact). 'E-Mail'",
		required: true,
		displayOptions: {
			show: {
				operation: ['ninoxScript'],
			},
		},
		routing: {
			send: {
				type: 'body',
				property: 'query',
			},
		},
		description: 'Use an Ninox Script to build your own query',
	},

	// ----------------------------------
	//         v1 Pagination Parameters
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['list'],
				'@version': [1],
			},
		},
		default: false,
		routing: {
			send: {
				paginate: '={{$value}}',
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['list'],
				returnAll: [false],
				'@version': [1],
			},
		},
		typeOptions: {
		},
		routing: {
			send: {
				type: 'query',
				property: 'page',
			},
		},
		default: 0,
		description: 'The page of results to return',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['list'],
				returnAll: [false],
				'@version': [1],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		routing: {
			send: {
				type: 'query',
				property: 'perPage',
			},
		},
		default: 100,
		description: 'Max number of results to return',
	},

];