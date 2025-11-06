import {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	NodeOperationError
} from 'n8n-workflow';

export const createRecordsOptions = async function (
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const item = this.getInputData() as INodeExecutionData;
	const nodeVersion = this.getNode().typeVersion;

	let bodyData = {} as IDataObject;

	// Handle v1 with addAllFields
	if (nodeVersion === 1) {
		const addAllFields = this.getNodeParameter('addAllFields', true) as boolean;
		let fields: string[] = [];

		if (!addAllFields) {
			fields = this.getNodeParameter('fieldsToSend') as string[];
		}

		// ensure it will be added, even if ids are provided
		// otherwise it will just update the existing record by ids
		if (item.json.id) delete item.json.id;

		// sending complete record, or just the fields?
		if (item.json.fields) {
			bodyData = item.json;
		} else {
			bodyData = {
				fields: item.json,
			};
		}

		// remove fields that should not be sent
		if (!addAllFields && bodyData.fields) {
			const cleanedFields = {} as IDataObject;
			for (const field of fields) {
				// @ts-ignore
				cleanedFields[field] = bodyData.fields[field];
			}
			bodyData.fields = cleanedFields;
		}
	}
	// Handle v2 with resourceMapper
	else {
		const dataMode = this.getNodeParameter('fields.mappingMode', 0) as string;

		// we defined what to send
		if (dataMode === 'defineBelow') {

			const mappingValues = this.getNodeParameter('fields.value', 0) as IDataObject;
			if (Object.keys(mappingValues).length === 0) {
				throw new NodeOperationError(
					this.getNode(),
					"At least one value has to be added under 'Fields to Send'",
				);
			}

			bodyData = {
				fields: mappingValues
			};

		}

		if(dataMode === 'autoMapInputData') { // the Input should be sent as fields
			// sending complete record, or just the fields?
			if (item.json.fields) {
				bodyData = item.json;
			} else {
				bodyData = {
					fields: item.json,
				};
			}
		}
	}

	// in every way we need to drop the id, since this is for creating records
	delete bodyData.id;

	// and add it
	requestOptions.body = bodyData;

	return requestOptions;
};