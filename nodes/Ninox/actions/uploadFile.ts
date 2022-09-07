import { 
	IBinaryData,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	NodeOperationError
} from 'n8n-workflow';

import FormData from 'form-data';

export const uploadFileOptions = async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
		const binaryPropertyName = this.getNodeParameter(
				'binaryPropertyName',
		) as string;
		const attachmentField = this.getNodeParameter(
			'attachmentField',
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
						binaryPropertyName,
				);

				const formData = new FormData();
				formData.append('file', binaryDataBuffer, binaryProperty.fileName);
				
				if(attachmentField){
					// works either for field names or field ids 
					formData.append('fieldName', attachmentField);
				}

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