import { 
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	IBinaryData,
	NodeOperationError
} from 'n8n-workflow';

import FormData from 'form-data';

function getFileName(
    itemIndex: number,
    mimeType: string,
    fileExt: string,
    fileName: string,
): string {
    let ext = fileExt;
    if (fileExt === undefined) {
        ext = mimeType.split('/')[1];
    }

    let name = `${fileName}.${ext}`;
    if (fileName === undefined) {
        name = `file-${itemIndex}.${ext}`;
    }
    return name;
}

export const uploadFileOptions = async function (
    this: IExecuteSingleFunctions,
    requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
    const binaryPropertyName = this.getNodeParameter(
        'binaryPropertyName',
    ) as string;
    const { body } = requestOptions;
    
    if(requestOptions.headers === undefined) requestOptions.headers = {};
    //requestOptions.headers['Content-Type'] = 'multipart/form-data';
    //requestOptions.headers['Accept'] = 'application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, */*;q=0.1';
    
    //requestOptions.encoding = null;
    //requestOptions.json = false;
    //requestOptions.bodyContentType = 'multipart/form-data'; */
    /*requestOptions.returnFullResponse = true;*/
    /*requestOptions.encoding = 'document';
    requestOptions.method = 'POST';
    requestOptions.json = false;
 */
    try {

            const item = this.getInputData();

            if (item.binary![binaryPropertyName as string] === undefined) {
                throw new NodeOperationError(
                    this.getNode(),
                    `No binary data property “${binaryPropertyName}” exists on item!`,
                );
            }


        const binaryProperty = item.binary![binaryPropertyName] as IBinaryData;
        const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(
            binaryPropertyName
        );

        /*requestOptions.body.formData = {};
        requestOptions.body.formData.file = {
            //@ts-ignore
            value: binaryDataBuffer,
            options: {
                //@ts-ignore
                filename: binaryProperty.fileName,
                //@ts-ignore
                contentType: binaryProperty.mimeType,
            },
        }; */


        return requestOptions;
    } catch (err) {
        throw new NodeOperationError(this.getNode(), `${err}`);
    }
};