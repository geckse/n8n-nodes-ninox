import { 
	IDataObject,
	IExecuteSingleFunctions, 
	IHttpRequestOptions,
	INodeExecutionData
} from 'n8n-workflow';

export const createRecordsOptions = async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
		const item = this.getInputData() as INodeExecutionData;
		const addAllFields = this.getNodeParameter('addAllFields');
		let fields: string[] = [];
		if(!addAllFields){
				fields = this.getNodeParameter('fields') as string[];
		}
		let bodyData = {} as IDataObject;
		// ensure it will be added, even if ids are provided
		// otherwise it will just update the existing record by ids
		if(item.json.id) delete item.json.id;

		bodyData = item.json;

		// remove fields that should not be sent
		if(!addAllFields && bodyData.fields){
				const cleanedFields = {} as IDataObject;
				for(const field of fields){
						// @ts-ignore
						cleanedFields[field] = bodyData.fields[field];
				}
				bodyData.fields = cleanedFields;
		}

		// and add it
		requestOptions.body = bodyData;

		return requestOptions;
};