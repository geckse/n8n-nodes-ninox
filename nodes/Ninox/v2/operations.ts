import { INodePropertyOptions } from 'n8n-workflow';
import { createRecordsOptions } from '../actions/record/createRecords';
import { updateRecordsOptions } from '../actions/record/updateRecords';
import { uploadFileOptions } from '../actions/file/uploadFile';
import { handleIncommingFile } from '../actions/file/handleIncommingFile';

export const v2Operations: INodePropertyOptions[] = [
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
			operations: {
				pagination: async function(this, requestOptions) {
					const returnData = [];
					let page = 0;
					const limit = this.getNodeParameter('limit', 500) as number;
					const returnAll = this.getNodeParameter('returnAll', false) as boolean;
					const maxPages = 100;
					const seenIds = new Set();

					while (page < maxPages) {
						// Add pagination params - always use 500 for efficiency
						requestOptions.options.qs = requestOptions.options.qs || {};
						requestOptions.options.qs.page = page;
						requestOptions.options.qs.perPage = 500;

						// Make request
						const responseData = await this.makeRoutingRequest(requestOptions);

						// Check if we got data
						if (!Array.isArray(responseData) || responseData.length === 0) {
							break; // Empty response, stop
						}

						// Check for duplicate data (API returning same page)
						if (responseData[0]?.id && seenIds.has(responseData[0].id)) {
							break; // Duplicate found, stop
						}

						// Track IDs and add data
						for (const item of responseData) {
							if (item.id) seenIds.add(item.id);
							returnData.push(item);

							// If not returning all and we've hit the limit, stop
							if (!returnAll && returnData.length >= limit) {
								return this.helpers.returnJsonArray(returnData.slice(0, limit));
							}
						}

						// If we got less than 500, we're on last page
						if (responseData.length < 500) {
							break;
						}

						page++;
					}

					// Apply limit if not returning all
					if (!returnAll && returnData.length > limit) {
						return this.helpers.returnJsonArray(returnData.slice(0, limit));
					}

					return this.helpers.returnJsonArray(returnData);
				}
			}
		},
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
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
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
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
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
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
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
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
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
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
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['file'],
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
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['file'],
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
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['file'],
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
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['file'],
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
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['record'],
			},
		},
	},
];