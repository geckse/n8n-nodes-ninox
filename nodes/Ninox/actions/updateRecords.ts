import { 
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions, 
	INodeExecutionData
} from 'n8n-workflow';

export const updateRecordsOptions = async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
		const item = this.getInputData() as INodeExecutionData;
		const recordId = this.getNodeParameter('recordId');
		const addAllFields = this.getNodeParameter('addAllFields');
		let fields: string[] = [];
		if(!addAllFields){
				fields = this.getNodeParameter('fields') as string[];
		}										
		let bodyData = {} as IDataObject;

		// sending complete record, or just the fields?
		if(item.json.id && item.json.fields){
				bodyData = item.json;
		} else { 
				bodyData = {
						id: recordId,
						fields: item.json,
				};
		}

		// remove fields that should not be sent
		if(!addAllFields && bodyData.fields){
				const cleanedFields = {} as IDataObject;
				for(const field of fields){
						// @ts-ignore
						cleanedFields[field] = bodyData.fields[field];
				}
				bodyData.fields = cleanedFields;
		}

		if(bodyData.id !== recordId){
				throw new Error('The Record ID does not match the provided recordId. Consider using an expression to dynamical update multiple records.');
		}

		// and add it
		requestOptions.body = bodyData;

		return requestOptions;
};