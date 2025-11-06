import { INodeProperties } from 'n8n-workflow';

export const v1Parameters: INodeProperties[] = [
	// ----------------------------------
	//         v1 Record ID Parameters
	// ----------------------------------
	// v1 Read recordId
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [1],
				operation: ['read'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the record to return',
	},
	// v1 Update recordId
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [1],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'Update a record. Use an expression to update many incoming records.',
	},
	// v1 Delete recordId
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [1],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'Delete a record',
	},

	// ----------------------------------
	//         v1 File Parameters
	// ----------------------------------
	// v1 File operations recordId
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [1],
				operation: ['listFiles', 'getFile', 'uploadFile', 'deleteFile'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the record with the attachments',
	},
	// v1 fileName
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [1],
				operation: ['getFile', 'deleteFile'],
			},
		},
		default: '',
		required: true,
		description: 'The file ID',
	},
	// v1 binaryPropertyName
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [1],
				operation: ['uploadFile'],
			},
		},
		default: 'data',
		required: true,
		description: 'Name of the binary property in which the file can be found',
	},
	// v1 attachmentField
	{
		displayName: 'Attachment Field',
		name: 'attachmentField',
		type: 'string',
		displayOptions: {
			show: {
				'@version': [1],
				operation: ['uploadFile'],
			},
		},
		default: '',
		description: 'Name or ID of a field where the attachment should be added. If empty, the file will be added to the records attachment.',
	},

	// ----------------------------------
	//         v1 Field Mapping (addAllFields)
	// ----------------------------------
	{
		displayName: 'Add All Fields',
		name: 'addAllFields',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				'@version': [1],
			},
		},
		default: true,
		description: 'Whether to send all fields to Ninox or only specific ones',
	},
	{
		displayName: 'Fields',
		name: 'fieldsToSend',
		type: 'string',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Field',
		},
		displayOptions: {
			show: {
				addAllFields: [false],
				operation: ['create', 'update'],
				'@version': [1],
			},
		},
		default: [],
		placeholder: 'Name',
		required: true,
		description: 'The name of fields for which data should be sent to Ninox',
	},
];