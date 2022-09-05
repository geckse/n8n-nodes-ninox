import { 
	IExecuteSingleFunctions, 
	IHttpRequestOptions
} from 'n8n-workflow';

export const appendRecordsOptions = async function (
    this: IExecuteSingleFunctions,
    requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
    let item = this.getInputData() as any;
    let addAllFields = this.getNodeParameter('addAllFields');
    let fields = Array<string>();
    if(!addAllFields){
        fields = this.getNodeParameter('fields') as string[];
    }
    let bodyData = {} as any;
    // ensure it will be added, even if ids are provided
    // otherwise it will just update the existing record by ids
    if(item.json.id) delete item.json.id;

    bodyData = item.json;

    // remove fields that should not be sent
    if(!addAllFields && bodyData.fields){
        let cleanedFields = {} as any;
        for(let field of fields){
            cleanedFields[field] = bodyData.fields[field];
        }
        bodyData.fields = cleanedFields;
    }

    // and add it
    requestOptions.body = bodyData;

    return requestOptions;
};