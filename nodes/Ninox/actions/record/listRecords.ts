import {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';

export const listRecordsOptions = async function (
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as IDataObject;

	// Handle filters fixedCollection
	if (additionalOptions.filters) {
		const filters = additionalOptions.filters as IDataObject;
		const filtersData: IDataObject = {};

		if (filters.filter && Array.isArray(filters.filter)) {
			const filterValues = filters.filter as IDataObject[];
			for (const filter of filterValues) {
				filtersData[filter.fieldId as string] = filter.value;
			}
		}

		// Only add if we have filters
		if (Object.keys(filtersData).length > 0) {
			// Initialize qs if it doesn't exist
			if (!requestOptions.qs) {
				requestOptions.qs = {};
			}
			// Wrap in fields object as required by Ninox API
			requestOptions.qs.filters = JSON.stringify({ fields: filtersData });
		}
	}

	return requestOptions;
};
