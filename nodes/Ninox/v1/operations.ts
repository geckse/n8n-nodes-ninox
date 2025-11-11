import { INodePropertyOptions, IExecuteSingleFunctions, INodeExecutionData, IDataObject, IN8nHttpFullResponse, INodeParameterResourceLocator, IHttpRequestOptions } from 'n8n-workflow';
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
				preSend: [
					async function(this: IExecuteSingleFunctions, requestOptions: IHttpRequestOptions) {
						const readOnlyQuery = this.getNodeParameter('readOnlyQuery', 0) as boolean;
						const script = this.getNodeParameter('script', 0) as string;

						if (readOnlyQuery) {
							// Switch to GET method and move query to query params
							requestOptions.method = 'GET';
							requestOptions.qs = requestOptions.qs || {};
							(requestOptions.qs as IDataObject).query = script;
							// Remove from body if it exists
							if (requestOptions.body && typeof requestOptions.body === 'object') {
								delete (requestOptions.body as IDataObject).query;
							}
						} else {
							// Use POST with body (default behavior)
							requestOptions.method = 'POST';
							requestOptions.body = requestOptions.body || {};
							(requestOptions.body as IDataObject).query = script;
						}

						return requestOptions;
					},
				],
			},
			output: {
				postReceive: [
					async function(this: IExecuteSingleFunctions, items: INodeExecutionData[], response: IN8nHttpFullResponse) {
						const responseData = response.body;
						const parseAsJson = this.getNodeParameter('parseAsJson', 0) as boolean;
						const splitIntoItems = this.getNodeParameter('splitIntoItems', 0) as boolean;
						const fetchAsRecords = this.getNodeParameter('fetchAsRecords', 0) as boolean;

						// Check if response is empty/null/undefined
						const isEmpty = responseData === null ||
							responseData === undefined ||
							responseData === '' ||
							(typeof responseData === 'object' && !Array.isArray(responseData) && Object.keys(responseData as IDataObject).length === 0);

						// If response is empty, return empty item
						if (isEmpty) {
							return [{
								json: {},
								pairedItem: { item: 0 },
							}];
						}

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
									json: jsonData as IDataObject,
									pairedItem: { item: 0 },
								}];
							} catch (error: unknown) {
								throw new Error(
									`Failed to parse response as JSON: ${error instanceof Error ? error.message : String(error)}. ` +
									`Response: ${JSON.stringify(responseData).substring(0, 200)}`
								);
							}
						}

						if (!splitIntoItems) {
							// Return the script response as-is
							return items;
						}

						let arrayItems: unknown[] = [];

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
							const stringData: string = actualData;
						arrayItems = stringData
								.split(',')
								.map((item: string) => item.trim())
								.filter((item: string) => item.length > 0);
						} else if (actualData === null || actualData === undefined) {
							// Handle null/undefined as empty array
							arrayItems = [];
						} else {
							throw new Error(
								`Script did not return an array or string to split. ` +
								`Expected array or comma-separated string but received: ${typeof actualData}. ` +
								`Response data: ${JSON.stringify(actualData).substring(0, 200)}. ` +
								`Please disable "Split Into Items" option.`
							);
						}

						// If no items, return empty item instead of error
						if (arrayItems.length === 0) {
							return [{
								json: {},
								pairedItem: { item: 0 },
							}];
						}

						// If fetchAsRecords is enabled, treat items as record IDs and fetch them
						if (fetchAsRecords) {
							// Convert all items to strings for ID validation
							const recordIds = arrayItems.map((id: unknown) => String(id).trim()).filter((id: string) => id.length > 0);

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
							const teamId = (typeof teamIdParam === 'object' && teamIdParam !== null && 'value' in teamIdParam
								? (teamIdParam as INodeParameterResourceLocator).value
								: teamIdParam) as string;

							const databaseIdParam = this.getNodeParameter('databaseId', 0);
							const databaseId = (typeof databaseIdParam === 'object' && databaseIdParam !== null && 'value' in databaseIdParam
								? (databaseIdParam as INodeParameterResourceLocator).value
								: databaseIdParam) as string;

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
										method: 'GET' as const,
										url: `${baseUrl}/teams/${teamId}/databases/${databaseId}/tables/${tableId}/records/${numericRecordId}`,
										headers: {
											'Authorization': `Bearer ${credentials.token}`,
											'Accept': 'application/json',
											'Content-Type': 'application/json',
										},
										json: true,
									};
									const record = await this.helpers.httpRequest(options) as IDataObject;
									fetchedRecords.push(record);
								} catch (error: unknown) {
									// Include error information for failed fetches
									fetchedRecords.push({
										id: recordId,
										error: `Failed to fetch record: ${error instanceof Error ? error.message : String(error)}`,
									});
								}
							}

							// Return the fetched records as individual items
							return fetchedRecords.map((record: IDataObject) => ({
								json: record,
								pairedItem: { item: 0 },
							}));
						} else {
							// Just split into items without fetching
							return arrayItems.map((item: unknown) => ({
								json: (typeof item === 'object' && item !== null ? item : { value: item }) as IDataObject,
								pairedItem: { item: 0 },
							}));
						}
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
];