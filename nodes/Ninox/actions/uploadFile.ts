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

        let formData = new FormData();
        formData.append('file', binaryDataBuffer, binaryProperty.fileName);
        requestOptions.body = formData;

        requestOptions.headers = {
            ...requestOptions.headers,
            ...formData.getHeaders(),
        };

        return requestOptions;
    } catch (err) {
        throw new NodeOperationError(this.getNode(), `${err}`);
    }
};