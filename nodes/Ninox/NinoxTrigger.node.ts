import { IPollFunctions } from 'n8n-core';

import {	
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError
} from 'n8n-workflow';

import { apiRequest, apiRequestAllItems } from './transport';

export class NinoxTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ninox Trigger',
		name: 'ninoxTrigger',
		icon: 'file:ninox.svg',
		group: ['trigger'],
		version: 1,
		subtitle: 'on record change',
		description: 'Starts the workflow when Ninox events occur',
		defaults: {
			name: 'Ninox Trigger',
			color: '#4970FF',
		},
		polling: true,
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'ninoxApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{ !$credentials.customBaseUrl ? "https://api.ninox.com/v1" : $credentials.baseUrl.replace(new RegExp("/$"), "") }}',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},

		/**
		 * In the properties array we have two mandatory options objects required
		 *
		 * [Resource & Operation]
		 *
		 * https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/#resources-and-operations
		 *
		 * In our example, the operations are separated into their own file (HTTPVerbDescription.ts)
		 * to keep this class easy to read.
		 *
		 */ 
		properties: [
			{
				displayName: 'Team ID',
				name: 'teamId',
				type: 'string',
				default: '',
				placeholder: '67mm9vc324bM7x',
				required: true,
				description: 'The ID of the team to access',
				/*typeOptions: {
					loadOptions: {
						routing: {
							request: {
								method: 'GET',
								url: 'teams',
							},
							output: {
								postReceive: [
								 	 {
										type: 'setKeyValue',
										properties: {
											name: '={{$responseItem.name}} - ({{$responseItem.id}})',
											value: '={{$responseItem.id}}',
										},
									},
									{
										type: 'sort',
										properties: {
											key: 'name',
										},
									}, 
								],
							},
						},
					},
				},*/
			},
			{
				displayName: 'Database ID',
				name: 'databaseId',
				type: 'string',
				default: '',
				placeholder: 'nk5xt24oixj4',
				required: true,
				description: 'The ID of the database to access',
			},
			{
				displayName: 'Table ID',
				name: 'tableId',
				type: 'string',
				default: '',
				placeholder: 'A',
				required: true,
				description: 'The ID of the table to access',
			},		
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {

		const webhookData = this.getWorkflowStaticData('node');

		const qs: IDataObject = {};

		const team = this.getNodeParameter('teamId') as string;

		const base = this.getNodeParameter('databaseId') as string;

		const table = this.getNodeParameter('tableId') as string;

		const endpoint = `teams/${team}/databases/${base}/tables/${table}/records`;

		let lastSequence = (webhookData.lastSequence as number) || 0;

		// this is the initial request, so get the last sequence number and do not run the trigger for all records ever created
		if(lastSequence === 0) {
			const initialRecord = await apiRequest.call(this, 'GET', endpoint, {}, { updated: true, perPage: 1 });
			if(initialRecord.length > 0) {
				lastSequence = initialRecord[0].sequence;
			}
		}

		// query for all records updated since the last sequence number
		qs.updated = true;
		qs.sinceSq = lastSequence;

		let records = [];
		if (this.getMode() === 'manual') {
			delete qs.sinceSq;
			qs.updated = true;
			qs.perPage = 1;
			records = await apiRequest.call(this, 'GET', endpoint, {}, qs);
		} else {
			records = await apiRequestAllItems.call(this, 'GET', endpoint, {}, qs);
		}

		// update the last sequence number
		if(records.length > 0) {
			lastSequence = records[0].sequence as number;
		}
		webhookData.lastSequence = lastSequence;

		if (Array.isArray(records) && records.length) {
			return [this.helpers.returnJsonArray(records)];
		}

		return null;
	}
	
}
