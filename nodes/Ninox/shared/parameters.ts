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
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTeams',
					searchable: true,
				},
			},
			{
				displayName: 'By URL',
				name: 'url',
				type: 'string',
				placeholder: 'https://app.ninox.com/#/teams/voiNdnWLGJ6f3Y4ar/database/ub5u88eb4b13/module/A',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: 'https://app.ninox.com/#/teams/[a-zA-Z0-9]{2,}.*',
							errorMessage: 'Not a valid Ninox URL',
						},
					},
				],
				extractValue: {
					type: 'regex',
					regex: 'https://app.ninox.com/#/teams/([a-zA-Z0-9]{2,})',
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[a-zA-Z0-9_]{2,}',
							errorMessage: 'Not a valid Ninox Team ID',
						},
					},
				],
				placeholder: 'voiNdnWLGJ6f3Y4ar',
			},
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
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getDatabases',
					searchable: true,
				},
			},
			{
				displayName: 'By URL',
				name: 'url',
				type: 'string',
				placeholder: 'https://app.ninox.com/#/teams/voiNdnWLGJ6f3Y4ar/database/ub5u88eb4b13/module/A',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: 'https://app.ninox.com/#/teams/[a-zA-Z0-9]{2,}/database/[a-zA-Z0-9]{2,}.*',
							errorMessage: 'Not a valid Ninox URL',
						},
					},
				],
				extractValue: {
					type: 'regex',
					regex: 'https://app.ninox.com/#/teams/[a-zA-Z0-9]{2,}/database/([a-zA-Z0-9]{2,})',
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[a-zA-Z0-9_]{2,}',
							errorMessage: 'Not a valid Ninox Database ID',
						},
					},
				],
				placeholder: 'ub5u88eb4b13',
			},
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
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTables',
					searchable: true,
				},
			},
			{
				displayName: 'By URL',
				name: 'url',
				type: 'string',
				placeholder: 'https://app.ninox.com/#/teams/voiNdnWLGJ6f3Y4ar/database/ub5u88eb4b13/module/A',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: 'https://app.ninox.com/#/teams/[a-zA-Z0-9]{2,}/database/[a-zA-Z0-9]{2,}/module/[a-zA-Z0-9]{1,}.*',
							errorMessage: 'Not a valid Ninox URL',
						},
					},
				],
				extractValue: {
					type: 'regex',
					regex: 'https://app.ninox.com/#/teams/[a-zA-Z0-9]{2,}/database/[a-zA-Z0-9]{2,}/module/([a-zA-Z0-9]{1,})',
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[a-zA-Z0-9_]{1,}',
							errorMessage: 'Not a valid Ninox Table ID',
						},
					},
				],
				placeholder: 'A',
			},
		],
		description: 'The ID of the table to access. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},

	// ----------------------------------
	//         Ninox Script Parameter (shared for both v1 and v2)
	// ----------------------------------
	{
		displayName: 'Read Only Queries',
		name: 'readOnlyQuery',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['ninoxScript'],
			},
		},
		default: false,
		description: 'Whether to use GET method for read-only queries instead of POST. Enable this for queries that only read data without making changes.',
	},
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
		description: 'Use an Ninox Script to build your own query',
	},
	{
		displayName: 'Parse As JSON',
		name: 'parseAsJson',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['ninoxScript'],
			},
		},
		default: false,
		description: 'Whether to parse the entire response as JSON and return it as a single item. Useful for complex data structures.',
	},
	{
		displayName: 'Split Into Items',
		name: 'splitIntoItems',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['ninoxScript'],
				parseAsJson: [false],
			},
		},
		default: false,
		description: 'Whether to split the script results into separate items if it returns an array. Each array element becomes an individual item.',
	},
	{
		displayName: 'Fetch As Records',
		name: 'fetchAsRecords',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['ninoxScript'],
				parseAsJson: [false],
				splitIntoItems: [true],
			},
		},
		default: false,
		description: 'Whether to treat the array values as record IDs and fetch each record when "Split Into Items" is enabled. Will show an error if values are not valid record IDs.',
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
		default: 50,
		description: 'Max number of results to return',
	},

];
