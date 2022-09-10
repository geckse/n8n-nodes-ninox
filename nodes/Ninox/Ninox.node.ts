import { 
	ILoadOptionsFunctions, 
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription
} from 'n8n-workflow';

import { createRecordsOptions } from './actions/createRecords';
import { updateRecordsOptions } from './actions/updateRecords';
import { uploadFileOptions } from './actions/uploadFile';
import { handleIncommingFile } from './actions/handleIncommingFile';

import { apiRequest } from './transport';

export class Ninox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ninox',
		name: 'ninox',
		icon: 'file:ninox.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Read, create and update data from Ninox',
		defaults: {
			name: 'Ninox',
			color: '#4970FF',
		},
		inputs: ['main'],
		outputs: ['main'],
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
		 * In the properties array we have two mandatory options objects required
		 *
		 * [Resource & Operation]
		 *
		 * https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/#resources-and-operations
		 *
		 * In our example, the operations are separated into their own file (HTTPVerbDescription.ts)
		 * to keep this class easy to read.
		 *
		 */ 
		properties: [
			// ----------------------------------
			//         Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
				options: [
					{
						name: 'List',
						value: 'list',
						action: 'List data from a table',
						description: 'List the data from a table',
						routing: {
							request: {
								method: 'GET',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records',
							},
						},
					},				
					{
						name: 'Read',
						value: 'read',
						action: 'Read data from a record',
						description: 'Read the data from a record',
						routing: {
							request: {
								method: 'GET',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records/{{$parameter.recordId}}',
							},
						},
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create new records in a table',
						action: 'Create new records in a table',
						routing: {
							request: {
								method: 'POST',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records',
							},
							send: {
								paginate: false,
								preSend: [createRecordsOptions],
								type: 'body',
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update the data of a record in a table',
						action: 'Update the data of a record in a table',
						routing: {
							request: {
								method: 'POST',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records',
							},
							send: {
								paginate: false,
								preSend: [updateRecordsOptions],
								type: 'body',
							},
						},
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete a record from a table',
						description: 'Delete a record from a table',
						routing: {
							request: {
								method: 'DELETE',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records/{{$parameter.recordId}}',
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ { "success": true } }}',
										},
									},
								],
							},
						},
					},
					{
						name: 'List Attached Files',
						value: 'listFiles',
						action: 'Get the attached files from a record',
						description: 'Get attachments from a record',
						routing: {
							request: {
								method: 'GET',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records/{{$parameter.recordId}}/files',
							},
						},
					},
					{
						name: 'Download Attached File',
						value: 'getFile',
						action: 'Download attached file from a record by the file name',
						description: 'Download an attached file from a record by the file name',
						routing: {
							request: {
								method: 'GET',	
								returnFullResponse: true,
								encoding: 'arraybuffer',						
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records/{{$parameter.recordId}}/files/{{$parameter.fileName}}',
							},
							output: {
								postReceive: [handleIncommingFile],
							},
						},						
					},
					{
						name: 'Upload File Attachment',
						value: 'uploadFile',
						action: 'Add a file to a record',
						description: 'Add a file to a record',
						routing: {
							request: {
								method: 'POST',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records/{{$parameter.recordId}}/files',
							},
							send: {
								paginate: false,
								preSend: [uploadFileOptions],
								type: 'body',
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ { "success": true } }}',
										},
									},
								],
							},
						},	
					},
					{
						name: 'Delete Attached File',
						value: 'deleteFile',
						action: 'Delete an attachment of a record from a table',
						description: 'Delete an attachment of a record from a table',
						routing: {
							request: {
								method: 'DELETE',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records/{{$parameter.recordId}}/files/{{$parameter.fileName}}',
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ { "success": true } }}',
										},
									},
								],
							},
						},
					},
					{
						name: 'Ninox Script',
						value: 'ninoxScript',
						description: 'Send and run a Ninox Script to query data or run actions on your Ninox database',
						action: 'Send a ninox script to your database',
						routing: {
							request: {
								method: 'POST',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/query',
							},
							send: {
								paginate: false,
								type: 'body',
							},
						},
					},
				],
				default: 'list',
			},

			{
				displayName: 'Team Name or ID',
				name: 'teamId',
				type: 'options',
				default: '',
				placeholder: '',
				required: true,
				description: 'The ID of the team to access. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				typeOptions: {
					loadOptionsMethod: 'getTeams',
				},
			},
			{
				displayName: 'Database Name or ID',
				name: 'databaseId',
				type: 'options',
				default: '',
				placeholder: '',
				required: true,
				description: 'The ID of the database to access. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				displayOptions: {
					hide: {
						teamId: [
							'',
						],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getDatabases',
				},
			},
			{
				displayName: 'Table Name or ID',
				name: 'tableId',
				type: 'options',
				default: '',
				placeholder: '',
				required: true,
				displayOptions: {
					hide: {
						teamId: [
							'',
						],
						databaseId: [
							'',
						],
						operation: [
							'ninoxScript',
						],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getTables',
				},
				description: 'The ID of the table to access. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			// ----------------------------------
			//         Ninox Script
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
						operation: [
							'ninoxScript',
						],
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
			//         Record ID Behavior
			// ----------------------------------
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'read',
						],
					},
				},
				default: '',
				required: true,
				description: 'ID of the record to return',
			},
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'update',
						],
					},
				},
				default: '',
				required: true,
				description: 'Update a record. Use an expression to update many incoming records.',
			},
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'delete',
						],
					},
				},
				default: '',
				required: true,
				description: 'Delete a record',
			},

			// ----------------------------------
			//         Files behavior
			// ----------------------------------

			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'listFiles',
							'getFile',
							'uploadFile',
						],
					},
				},
				default: '',
				required: true,
				description: 'ID of the record with the attachments',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'getFile',
						],
					},
				},
				default: '',
				required: true,
				description: 'The file ID',
			},
			{
				displayName: 'Binary Property Name',
				name: 'binaryPropertyName',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'uploadFile',
						],
					},
				},
				default: 'data',
				required: true,
				description: 'Name of the binary property in which the file can be found',
			},
			{
				displayName: 'Attachment Field',
				name: 'attachmentField',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'uploadFile',
						],
					},
				},
				default: '',
				description: 'Name or ID of a field where the attachment should be added. If empty, the file will be added to the records attachment.',
			},
			// ----------------------------------
			//         Pagination behavior
			// ----------------------------------
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
				default: false,
				routing: {
					operations: {
						pagination: {
							type: 'offset',
							properties: {
								limitParameter: 'perPage',
								offsetParameter: 'page',
								pageSize: 250,
								type: 'query',
							},
						},
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
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 250,
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
			//         All Fields behavior
			// ----------------------------------
			{
				displayName: 'Add All Fields',
				name: 'addAllFields',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: [
							'create',
							'update',
						],
					},
				},
				default: true,
				description: 'Whether to send all fields to Ninox or only specific ones',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Field',
				},
				displayOptions: {
					show: {
						addAllFields: [
							false,
						],
						operation: [
							'create',
							'update',
						],
					},
				},
				default: [],
				placeholder: 'Name',
				required: true,
				description: 'The name of fields for which data should be sent to Ninox',
			},
			// ----------------------------------
			//         Additional Optios 
			// ----------------------------------			
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
				default: {},
				description: 'Additional options which decide which records should be returned',
				placeholder: 'Add Option',
				options: [
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
						displayOptions: {
							hide: {
								sortUpdate: [
									true,
								],
								sortNew: [
									true,
								],
							},
						},
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
						displayOptions: {
							hide: {
								sort: [
									true,
								],
								sortNew: [
									true,
								],
							},
						},
						default: true,
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
						displayOptions: {
							hide: {
								sort: [
									true,
								],
								sortUpdate: [
									true,
								],
							},
						},
						default: true,
					},
					{
						displayName: 'Filters',
						name: 'filters',
						description: 'Return records that meet the criteria defined as query parameters',
						type: 'string',
						placeholder: '{"fields": {"Email": "example@mail.com"}}',
						routing: {
							send: {
								type: 'query',
								property: 'filters',
							},
						},
						default: '',
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

				],
			},	
		],
	};

	methods = {
		loadOptions: {
			async getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const teams = await apiRequest.call(
					this,
					'GET',
					'/teams',
					{},
					{},
				);
				// @ts-ignore
				const returnData = teams.map((o) => ({
					name: o.name,
					value: o.id,
				})) as INodePropertyOptions[];
				return returnData;
			},
			async getDatabases(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				
				const teamId = this.getCurrentNodeParameter('teamId') as string;

				const databases = await apiRequest.call(
					this,
					'GET',
					'/teams/'+teamId+'/databases',
					{},
					{},
				);
				// @ts-ignore
				const returnData = databases.map((o) => ({
					name: o.name,
					value: o.id,
				})) as INodePropertyOptions[];
				return returnData;
			},
			async getTables(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				
				const teamId = this.getCurrentNodeParameter('teamId') as string;
				const databaseId = this.getCurrentNodeParameter('databaseId') as string;

				const tables = await apiRequest.call(
					this,
					'GET',
					'/teams/'+teamId+'/databases/'+databaseId+'/tables',
					{},
					{},
				);
				// @ts-ignore
				const returnData = tables.map((o) => ({
					name: o.name,
					value: o.id,
				})) as INodePropertyOptions[];
				return returnData;
			},
		},
	};

}
