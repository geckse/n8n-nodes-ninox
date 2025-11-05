import { 
	IExecuteSingleFunctions,
		IN8nHttpFullResponse,
		INodeExecutionData,
	NodeOperationError
} from 'n8n-workflow';

export const handleIncommingFile = async function (
		this: IExecuteSingleFunctions,
		items: INodeExecutionData[],
		response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
		
		try {
				for(let i = 0; i < items.length; i++){
						let mimeType: string | undefined;
						if (response.headers['content-type']) {
								mimeType = response.headers['content-type'] as string;
						}

						const newItem: INodeExecutionData = {
								json: {},
								binary: {},
								pairedItem: {
										item: i,
								},
						};

						if (items[i].binary !== undefined) {
								// Create a shallow copy of the binary data so that the old
								// data references which do not get changed still stay behind
								// but the incoming data does not get changed.
								// @ts-ignore
								Object.assign(newItem.binary, items[i].binary);
						}

						const dataPropertyNameDownload = this.getNodeParameter(
								'fileName',
								i,
						) as string;

						// create buffer from body
						// @ts-ignore
						const data = Buffer.from(response.body as string);

						newItem.binary![dataPropertyNameDownload] = await this.helpers.prepareBinaryData(
								data as unknown as Buffer,
								dataPropertyNameDownload,
								mimeType,
						);  

						items[i] = newItem;
				} 

				return  items;
		} catch (err) {
				throw new NodeOperationError(this.getNode(), `${err}`);
		}
};