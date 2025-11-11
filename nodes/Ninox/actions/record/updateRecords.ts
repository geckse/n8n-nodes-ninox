import { 
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions, 
	INodeExecutionData,
	NodeOperationError
} from 'n8n-workflow';

export const updateRecordsOptions = async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
		const item = this.getInputData() as INodeExecutionData;
		const recordId = this.getNodeParameter('recordId');
		const nodeVersion = this.getNode().typeVersion;
		const upsert = this.getNodeParameter('upsert', false) as boolean;

		let bodyData = {} as IDataObject;

		// Handle v1 with addAllFields
		if (nodeVersion === 1) {
			const addAllFields = this.getNodeParameter('addAllFields', true) as boolean;
			let fields: string[] = [];

			if (!addAllFields) {
				fields = this.getNodeParameter('fieldsToSend') as string[];
			}

			// sending complete record, or just the fields?
			if (item.json.id && item.json.fields) {
				bodyData = item.json;
			} else {
				bodyData = {
					id: recordId,
					fields: item.json,
				};
			}

			// remove fields that should not be sent
			if (!addAllFields && bodyData.fields) {
				const cleanedFields = {} as IDataObject;
				const fieldsObject = bodyData.fields as IDataObject;
				for (const field of fields) {
					cleanedFields[field] = fieldsObject[field];
				}
				bodyData.fields = cleanedFields;
			}
		}
		// Handle v2 with resourceMapper
		else {
			const dataMode = this.getNodeParameter('fields.mappingMode', 0) as string;
			// we defined what to send
			if(dataMode === 'defineBelow'){

				const mappingValues = this.getNodeParameter('fields.value', 0) as IDataObject;
				if (Object.keys(mappingValues).length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						"At least one value has to be added under 'Fields to Send'",
					);
				}

				bodyData = {
					id: recordId,
					fields: mappingValues
				};

			}

			if(dataMode === 'autoMapInputData') { // the Input should be sent as fields
				// sending complete record, or just the fields?
				if(item.json.id && item.json.fields){
						bodyData = item.json;
				} else {
						bodyData = {
								id: recordId,
								fields: item.json,
						};
				}
			}
		}

		if(bodyData.id !== recordId){
				throw new Error('The Record ID does not match the provided recordId. Consider using an expression to dynamical update multiple records.');
		}

		// Add upsert flag if enabled
		if (upsert) {
			bodyData._upsert = true;
		}

		// and add it
		requestOptions.body = bodyData;

		return requestOptions;
};