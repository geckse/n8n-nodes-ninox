import { IExecuteFunctions, IHookFunctions, ILoadOptionsFunctions } from 'n8n-core';

import {
	GenericValue,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IPollFunctions,
	NodeOperationError,
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

	const baseUrl = 'https://api.ninoxdb.de/v1/'; // TODO: Get from node or credentials

	const options: IHttpRequestOptions = {
		method,
		body,
		qs: query,
		url: `${baseUrl}${endpoint}`,
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

	let responseData;
	query.page = 0;
	query.perPage = 250;

	do {
		responseData = await apiRequest.call(this, method, endpoint, body, query);
		query.page++;
		returnData.push.apply(returnData, responseData);
	} while (responseData.length !== 0);

	return returnData;
}