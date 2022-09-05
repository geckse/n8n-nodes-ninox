import { 
	IExecuteSingleFunctions, 
	IHttpRequestOptions
} from 'n8n-workflow';

export const updateRecordsOptions = async function (
    this: IExecuteSingleFunctions,
    requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
    let item = this.getInputData() as any;
    let recordId = this.getNodeParameter('recordId');
    let addAllFields = this.getNodeParameter('addAllFields');
    let fields = Array<string>();
    if(!addAllFields){
        fields = this.getNodeParameter('fields') as string[];
    }										
    let bodyData = {} as any;

    // sending complete record, or just the fields?
    if(item.json.id && item.json.fields){
        bodyData = item.json;
    } else { 
        bodyData = {
            id: recordId,
            fields: item.json
        };
    }

    // remove fields that should not be sent
    if(!addAllFields && bodyData.fields){
        let cleanedFields = {} as any;
        for(let field of fields){
            cleanedFields[field] = bodyData.fields[field];
        }
        bodyData.fields = cleanedFields;
    }

    if(bodyData.id != recordId){
        throw new Error('The Record ID does not match the provided recordId. Consider using an expression to dynamical update multiple records.');
    }

    // and add it
    requestOptions.body = bodyData;

    return requestOptions;
};