import { INodeType, INodeTypeDescription, IExecuteSingleFunctions, IHttpRequestOptions, IDataObject  } from 'n8n-workflow';

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
			baseURL: 'https://api.ninoxdb.de/v1/',
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
							}
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
							}
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
								preSend: [
									async function (
										this: IExecuteSingleFunctions,
										requestOptions: IHttpRequestOptions,
									): Promise<IHttpRequestOptions> {
										let item = this.getInputData() as any;
										let recordId = this.getNodeParameter('recordId');
										let addAllFields = this.getNodeParameter('addAllFields');
										let fields = Array<string>();
										if(!addAllFields){
											fields = this.getNodeParameter('fields') as string[];
										}										
										let bodyData = {} as any;

										// sending complete record, or just the fields?
										if(item.json.id && item.json.fields){
											bodyData = item.json;
										} else { 
											bodyData = {
												id: recordId,
												fields: item.json
											};
										}

										// remove fields that should not be sent
										if(!addAllFields && bodyData.fields){
											let cleanedFields = {} as any;
											for(let field of fields){
												cleanedFields[field] = bodyData.fields[field];
											}
											bodyData.fields = cleanedFields;
										}

										if(bodyData.id != recordId){
											throw new Error('The Record ID does not match the provided recordId. Consider using an expression to dynamical update multiple records.');
										}
										
										// and add it
										requestOptions.body = bodyData;

										return requestOptions;
									},
								],
								type: 'body'
							}
						},
					},
					{
						name: 'Append',
						value: 'append',
						description: 'Add multiple items to a table',
						action: 'Add multiple items to a table',
						routing: {
							request: {
								method: 'POST',
								url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}/records',
							},
							send: {
								paginate: false,
								preSend: [
									async function (
										this: IExecuteSingleFunctions,
										requestOptions: IHttpRequestOptions,
									): Promise<IHttpRequestOptions> {
										let item = this.getInputData() as any;
										let addAllFields = this.getNodeParameter('addAllFields');
										let fields = Array<string>();
										if(!addAllFields){
											fields = this.getNodeParameter('fields') as string[];
										}
										let bodyData = {} as any;
										// ensure it will be added, even if ids are provided
										// otherwise it will just update the existing record by ids
										if(item.json.id) delete item.json.id;

										bodyData = item.json;

										// remove fields that should not be sent
										if(!addAllFields && bodyData.fields){
											let cleanedFields = {} as any;
											for(let field of fields){
												cleanedFields[field] = bodyData.fields[field];
											}
											bodyData.fields = cleanedFields;
										}

										// and add it
										requestOptions.body = bodyData;

										return requestOptions;
									},
								],
								type: 'body'
							}
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
				],
				default: 'list',
			},

			{
				displayName: 'Team ID',
				name: 'teamId',
				type: 'string',
				default: '',
				placeholder: '67mm9vc324bM7x',
				required: true,
				description: 'The ID of the team to access',
				/*typeOptions: {
					loadOptions: {
						routing: {
							request: {
								method: 'GET',
								url: 'teams',
							},
							output: {
								postReceive: [
								 	 {
										type: 'setKeyValue',
										properties: {
											name: '={{$responseItem.name}} - ({{$responseItem.id}})',
											value: '={{$responseItem.id}}',
										},
									},
									{
										type: 'sort',
										properties: {
											key: 'name',
										},
									}, 
								],
							},
						},
					},
				},*/
			},
			{
				displayName: 'Database ID',
				name: 'databaseId',
				type: 'string',
				default: '',
				placeholder: 'nk5xt24oixj4',
				required: true,
				description: 'The ID of the database to access',
			},
			{
				displayName: 'Table ID',
				name: 'tableId',
				type: 'string',
				default: '',
				placeholder: 'A',
				required: true,
				description: 'The ID of the table to access',
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
				description: 'Id of the record to return.',
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
				description: 'Delete a record.',
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
					}
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
				default: 100,
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
							'append',
							'update'
						],
					},
				},
				default: true,
				description: 'If all fields should be sent to Ninox or only specific ones.',
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
							'append',
							'update'
						],
					},
				},
				default: [],
				placeholder: 'Name',
				required: true,
				description: 'The name of fields for which data should be sent to Ninox.',
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
						displayName: 'Sort',
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
				],
			},	
		],
	};
	
}
