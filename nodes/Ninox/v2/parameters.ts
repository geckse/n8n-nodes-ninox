import { INodeProperties } from 'n8n-workflow';

export const v2Parameters: INodeProperties[] = [
	// ----------------------------------
	//         Resource Parameter
	// ----------------------------------
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Schema',
				value: 'schema',
			},
			{
				name: 'Record',
				value: 'record',
			},
			{
				name: 'File',
				value: 'file',
			}
		],
		default: 'record',
		displayOptions: {
			show: {
				'@version': [2],
			},
		},
	},

	// ----------------------------------
	//         v2 Record ID Parameters
	// ----------------------------------
	// v2 Read recordId
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
				operation: ['read'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the record to return',
	},
	// v2 Update recordId
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'Update a record. Use an expression to update many incoming records.',
	},
	// v2 Update upsert toggle
	{
		displayName: 'Upsert',
		name: 'upsert',
		type: 'boolean',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Whether to insert a new record if the record with the given ID does not exist. When enabled, the operation will update existing records or create new ones.',
	},
	// v2 Delete recordId
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'Delete a record',
	},

	// ----------------------------------
	//         v2 File Parameters
	// ----------------------------------
	// v2 File operations recordId
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['file'],
				operation: ['listFiles', 'getFile', 'uploadFile', 'deleteFile'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the record with the attachments',
	},
	// v2 fileName
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['file'],
				operation: ['getFile', 'deleteFile'],
			},
		},
		default: '',
		required: true,
		description: 'The file ID',
	},
	// v2 binaryPropertyName
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['file'],
				operation: ['uploadFile'],
			},
		},
		default: 'data',
		required: true,
		description: 'Name of the binary property in which the file can be found',
	},
	// v2 attachmentField
	{
		displayName: 'Attachment Field',
		name: 'attachmentField',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['file'],
				operation: ['uploadFile'],
			},
		},
		default: '',
		description: 'Name or ID of a field where the attachment should be added. If empty, the file will be added to the records attachment.',
	},

	// ----------------------------------
	//         v2 Pagination Parameters
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
				operation: ['list'],
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
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
				operation: ['list'],
				returnAll: [false],
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

	// ----------------------------------
	//         v2 Field Mapping (resourceMapper)
	// ----------------------------------
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'resourceMapper',
		noDataExpression: true,
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ['tableId.value'],
			resourceMapper: {
				resourceMapperMethod: 'getFields',
				mode: 'add',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				multiKeyMatch: false,
				matchingFieldsLabels: {
					title: 'Field matching with your Ninox table',
					description: 'Map the fields of your node input to the fields of your Ninox table'
				},
			},
		},
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
				operation: ['create', 'update'],
			},
		},
	},

	// ----------------------------------
	//         v2 Additional Options
	// ----------------------------------
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
				operation: ['list'],
			},
		},
		default: {},
		description: 'Additional options which decide which records should be returned',
		placeholder: 'Add Option',
		options: [
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				description: 'The filters to apply',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						name: 'filter',
						displayName: 'Filter',
						values: [
							{
								displayName: 'Field ID',
								name: 'fieldId',
								type: 'string',
								default: '',
								description: 'The ID of the field to filter by',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The value to filter for',
							},
						],
					},
				],
			},
			{
				displayName: 'Since ID',
				name: 'sinceId',
				description: 'Show only records with a larger ID than the given ID',
				type: 'number',
				routing: {
					send: {
						type: 'query',
						property: 'sinceId',
					},
				},
				default: '',
			},
			{
				displayName: 'Since Sequence',
				name: 'sinceSq',
				description: 'Show only records created or modified since this sync sequence number',
				type: 'number',
				routing: {
					send: {
						type: 'query',
						property: 'sinceSq',
					},
				},
				default: '',
			},
			{
				displayName: 'Sort by Field',
				name: 'sort',
				placeholder: 'Add Sort Rule',
				description: 'Defines how the returned records should be ordered',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'property',
						displayName: 'Property',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								type: 'string',
								default: '',
								description: 'Name of the field to sort on',
								routing: {
									send: {
										type: 'query',
										property: 'order',
									},
								},
							},
							{
								displayName: 'Direction',
								name: 'direction',
								type: 'options',
								options: [
									{
										name: 'ASC',
										value: 'asc',
										description: 'Sort in ascending order (small -> large)',
										routing: {
											send: {
												type: 'query',
												property: 'desc',
												value: 'false',
											},
										},
									},
									{
										name: 'DESC',
										value: 'desc',
										description: 'Sort in descending order (large -> small)',
										routing: {
											send: {
												type: 'query',
												property: 'desc',
												value: 'true',
											},
										},
									},
								],
								default: 'asc',
								description: 'The sort direction',
							},
						],
					},
				],
			},
			{
				displayName: 'Sort by Latest Created',
				name: 'sortNew',
				description: 'Whether to show newest records first (not combinable with order)',
				type: 'boolean',
				routing: {
					send: {
						type: 'query',
						property: 'new',
						value: 'true',
					},
				},
				default: true,
			},
			{
				displayName: 'Sort by Latest Modified',
				name: 'sortUpdate',
				description: 'Whether to show last changed records first (not combinable with order)',
				type: 'boolean',
				routing: {
					send: {
						type: 'query',
						property: 'updated',
						value: 'true',
					},
				},
				default: true,
			}
		],
	},
];