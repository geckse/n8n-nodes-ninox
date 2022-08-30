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
				description: 'Update a record.',
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
						description: 'Update the record data in a table',
						action: 'Update the record data in a table',
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
		],
	};
	
}
