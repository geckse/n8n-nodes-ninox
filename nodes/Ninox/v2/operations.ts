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
			output: {
				postReceive: [
					async function(this: any, items: any, responseData: any) {
						const parseAsJson = this.getNodeParameter('parseAsJson', 0) as boolean;
						const splitIntoItems = this.getNodeParameter('splitIntoItems', 0) as boolean;
						const fetchAsRecords = this.getNodeParameter('fetchAsRecords', 0) as boolean;

						// If parseAsJson is enabled, parse the entire response as JSON
						if (parseAsJson) {
							try {
								let jsonData = responseData;

								// If the response is wrapped in items structure, extract it
								if (items && items.length > 0 && items[0].json) {
									jsonData = items[0].json;
								}

								// If it's a string, try to parse it as JSON
								if (typeof jsonData === 'string') {
									jsonData = JSON.parse(jsonData);
								}

								// Return the parsed data as a single item
								return [{
									json: jsonData,
									pairedItem: { item: 0 },
								}];
							} catch (error: any) {
								throw new Error(
									`Failed to parse response as JSON: ${error.message}. ` +
									`Response: ${JSON.stringify(responseData).substring(0, 200)}`
								);
							}
						}

						if (!splitIntoItems) {
							// Return the script response as-is
							return items;
						}

						let arrayItems: any[] = [];

						// First, extract the actual data from items if responseData is not the raw response
						let actualData = responseData;
						if (items && items.length > 0 && items[0].json) {
							actualData = items[0].json;
						}

						// Handle nested array structure [["ID1", "ID2", "ID3"]] or single array
						if (Array.isArray(actualData)) {
							// Check if it's a nested array
							if (actualData.length > 0 && Array.isArray(actualData[0])) {
								// Flatten the nested array
								arrayItems = actualData[0];
							} else {
								// Single array
								arrayItems = actualData;
							}
						} else if (typeof actualData === 'string') {
							// Handle comma-separated string (fallback)
							arrayItems = actualData
								.split(',')
								.map((item: string) => item.trim())
								.filter((item: string) => item.length > 0);
						} else {
							throw new Error(
								`Script did not return an array or string to split. ` +
								`Expected array or comma-separated string but received: ${typeof actualData}. ` +
								`Response data: ${JSON.stringify(actualData).substring(0, 200)}. ` +
								`Please disable "Split Into Items" option.`
							);
						}

						if (arrayItems.length === 0) {
							throw new Error(
								'Script returned no items to split. ' +
								'Please check your script or disable "Split Into Items" option.'
							);
						}

						// If fetchAsRecords is enabled, treat items as record IDs and fetch them
						if (fetchAsRecords) {
							// Convert all items to strings for ID validation
							const recordIds = arrayItems.map((id: any) => String(id).trim()).filter((id: string) => id.length > 0);

							// Validate that IDs look like valid record IDs (alphanumeric)
							const invalidIds = recordIds.filter((id: string) => !/^[a-zA-Z0-9]+$/.test(id));
							if (invalidIds.length > 0) {
								throw new Error(
									`Script returned invalid record IDs: ${invalidIds.join(', ')}. ` +
									`Please disable "Fetch As Records" option if not returning record IDs.`
								);
							}

							// Get the team and database parameters for the API calls
							// Handle resourceLocator format for teamId and databaseId
							const teamIdParam = this.getNodeParameter('teamId', 0);
							const teamId = typeof teamIdParam === 'object' ? teamIdParam.value : teamIdParam;

							const databaseIdParam = this.getNodeParameter('databaseId', 0);
							const databaseId = typeof databaseIdParam === 'object' ? databaseIdParam.value : databaseIdParam;

							// Fetch each record
							const fetchedRecords = [];
							for (const recordId of recordIds) {
								try {
									// Extract table ID and numeric record ID (e.g., "B78670" -> table "B", record "78670")
									const match = recordId.match(/^([A-Z]+)(\d+)$/i);
									if (!match) {
										throw new Error(`Invalid record ID format: ${recordId}. Expected format like "B78670" where letters indicate the table.`);
									}
									const tableId = match[1];
									const numericRecordId = match[2];

									// Get credentials and base URL
									const credentials = await this.getCredentials('ninoxApi');
									const baseUrl = credentials.customBaseUrl ?
										String(credentials.baseUrl).replace(/\/$/, '') :
										'https://api.ninox.com/v1';

									const options = {
										method: 'GET',
										url: `${baseUrl}/teams/${teamId}/databases/${databaseId}/tables/${tableId}/records/${numericRecordId}`,
										headers: {
											'Authorization': `Bearer ${credentials.token}`,
											'Accept': 'application/json',
											'Content-Type': 'application/json',
										},
										json: true,
									};
									const record = await this.helpers.request(options);
									fetchedRecords.push(record);
								} catch (error: any) {
									// Include error information for failed fetches
									fetchedRecords.push({
										id: recordId,
										error: `Failed to fetch record: ${error.message}`,
									});
								}
							}

							// Return the fetched records as individual items
							return fetchedRecords.map((record: any) => ({
								json: record,
								pairedItem: { item: 0 },
							}));
						} else {
							// Just split into items without fetching
							return arrayItems.map((item: any) => ({
								json: typeof item === 'object' ? item : { value: item },
								pairedItem: { item: 0 },
							}));
						}
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
	// Schema operations
	{
		name: 'Get Database Schema',
		value: 'getDatabaseSchema',
		description: 'Retrieve the schema for a single database',
		action: 'Get database schema',
		routing: {
			request: {
				method: 'GET',
				url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}',
			},
		},
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['schema'],
			},
		},
	},
	{
		name: 'Get Tables Schema',
		value: 'getTablesSchema',
		description: 'Retrieve the schema for all tables in a database',
		action: 'Get all tables schema',
		routing: {
			request: {
				method: 'GET',
				url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables',
			},
		},
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['schema'],
			},
		},
	},
	{
		name: 'Get Single Table Schema',
		value: 'getTableSchema',
		description: 'Retrieve the schema for a single table',
		action: 'Get single table schema',
		routing: {
			request: {
				method: 'GET',
				url: '=teams/{{$parameter.teamId}}/databases/{{$parameter.databaseId}}/tables/{{$parameter.tableId}}',
			},
		},
		displayOptions: {
			show: {
				'@version': [2],
				resource: ['schema'],
			},
		},
	},
];