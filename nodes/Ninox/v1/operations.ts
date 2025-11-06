import { INodePropertyOptions } from 'n8n-workflow';
import { createRecordsOptions } from '../actions/record/createRecords';
import { updateRecordsOptions } from '../actions/record/updateRecords';
import { uploadFileOptions } from '../actions/file/uploadFile';
import { handleIncommingFile } from '../actions/file/handleIncommingFile';

export const v1Operations: INodePropertyOptions[] = [
	// v1 List operation (no resource check)
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
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ Array.isArray($response.body) && $response.body.length > 0 }}',
						request: {
							qs: {
								page: '={{ $request.qs.page ? $request.qs.page + 1 : 0 }}',
								perPage: 10,
							}
						}
					}
				}
			}
		},
		displayOptions: {
			show: {
				'@version': [1],
			},
		},
	},
	// v1 Read operation
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
				'@version': [1],
			},
		},
	},
	// v1 Create operation
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
				'@version': [1],
			},
		},
	},
	// v1 Update operation
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
				'@version': [1],
			},
		},
	},
	// v1 Delete operation
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
				'@version': [1],
			},
		},
	},
	// v1 List Attached Files
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
				'@version': [1],
			},
			hide: {
				'@version': [2],
			},
		},
	},
	// v1 Download Attached File
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
				'@version': [1],
			},
			hide: {
				'@version': [2],
			},
		},
	},
	// v1 Upload File Attachment
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
				'@version': [1],
			},
			hide: {
				'@version': [2],
			},
		},
	},
	// v1 Delete Attached File
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
				'@version': [1],
			},
			hide: {
				'@version': [2],
			},
		},
	},
	// v1 Ninox Script operation
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
				'@version': [1],
			},
		},
	},
];