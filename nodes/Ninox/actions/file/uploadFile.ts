/*
	Note about the eslint disable lines:
	I need FormData, somehow default n8n nodes also rely on it.
	Since it's also native in node 18+, I don't think the linter should be aggressive about it.
	@geckse 
*/

// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import type FormData from 'form-data';
import {
	IBinaryData,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	NodeOperationError
} from 'n8n-workflow';

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

		// Use form-data package available in n8n runtime (type-only import above)
		// eslint-disable-next-line @typescript-eslint/no-require-imports, @n8n/community-nodes/no-restricted-imports
		const FormDataConstructor = require('form-data');
		const formData = new FormDataConstructor() as FormData;
		formData.append('file', binaryDataBuffer, binaryProperty.fileName);

		if (attachmentField) {
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