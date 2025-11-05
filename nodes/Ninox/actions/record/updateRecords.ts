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
		
		let bodyData = {} as IDataObject;
				
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

		if(bodyData.id !== recordId){
				throw new Error('The Record ID does not match the provided recordId. Consider using an expression to dynamical update multiple records.');
		}

		// and add it
		requestOptions.body = bodyData;

		return requestOptions;
};