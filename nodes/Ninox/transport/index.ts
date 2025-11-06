import {
	GenericValue,
	ICredentialDataDecryptedObject,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IPollFunctions,
	IExecuteFunctions, 
	IHookFunctions, 
	ILoadOptionsFunctions 
} from 'n8n-workflow';

/**
 * Make an API request to Ninox
 */
export async function apiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | GenericValue | GenericValue[] = {},
	query: IDataObject = {},
) {
	
	const creds = (await this.getCredentials('ninoxApi')) as ICredentialDataDecryptedObject;
	const baseUrl = (creds.baseUrl ? creds.baseUrl.toString().replace(/\/$/, '') : 'https://api.ninox.com/v1') as string;

	const options: IHttpRequestOptions = {
		method,
		body,
		qs: query,
		url: `${baseUrl}/${endpoint}`,
		headers: {
			'content-type': 'application/json; charset=utf-8',
		},
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'ninoxApi', options);
}

export async function apiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD',
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
) {
	const returnData: IDataObject[] = [];
	const perPage = 500;  // Maximum allowed by Ninox API
	const maxPages = 100; // Safety limit to prevent infinite loops
	const seenIds = new Set<number>();

	let responseData;
	let pageCount = 0;
	let duplicateFound = false;
	query.page = 0;  // Start from page 0 (0-based indexing)
	query.perPage = perPage;

	do {
		responseData = await apiRequest.call(this, method, endpoint, body, query);
		query.page++;
		pageCount++;

		// Check for duplicate IDs (indicates we're getting the same page again)
		if (responseData.length > 0 && responseData[0].id) {
			const firstId = responseData[0].id;
			if (seenIds.has(firstId)) {
				duplicateFound = true;
				break;  // Stop immediately if we see duplicate data
			}
		}

		// Track all IDs and add data
		if (responseData.length > 0) {
			for (const item of responseData) {
				if (item.id) {
					seenIds.add(item.id);
				}
			}
			returnData.push.apply(returnData, responseData);
		}

		// Stop if:
		// 1. No data returned
		// 2. Less than perPage items returned (last page)
		// 3. Exceeded max pages (safety limit)
		// 4. Found duplicate IDs (API returning same page)
	} while (responseData.length === perPage && pageCount < maxPages && !duplicateFound);

	return returnData;
}