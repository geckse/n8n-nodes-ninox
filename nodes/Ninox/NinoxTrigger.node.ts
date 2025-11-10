import {
	type IDataObject,
	type ILoadOptionsFunctions,
	type INodeExecutionData,
	type INodePropertyOptions,
	type INodeType,
	type IPollFunctions,
	type INodeTypeDescription,
	NodeConnectionTypes,
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
		},
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
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
				displayName: 'Team Name or ID',
				name: 'teamId',
				type: 'options',
				default: '',
				placeholder: '',
				required: true,
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getTeams',
				},
			},
			{
				displayName: 'Database Name or ID',
				name: 'databaseId',
				type: 'options',
				default: '',
				placeholder: '',
				required: true,
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					hide: {
						teamId: [
							'',
						],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getDatabases',
				},
			},
			{
				displayName: 'Table Name or ID',
				name: 'tableId',
				type: 'options',
				default: '',
				placeholder: '',
				required: true,
				displayOptions: {
					hide: {
						teamId: [
							'',
						],
						databaseId: [
							'',
						],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getTables',
				},
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},	
		],
	};

	methods = {
		loadOptions: {
			async getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const teams = await apiRequest.call(
					this,
					'GET',
					'/teams',
					{},
					{},
				);
				const returnData = (teams as IDataObject[]).map((o) => ({
					name: o.name as string,
					value: o.id as string,
				})) as INodePropertyOptions[];
				return returnData;
			},
			async getDatabases(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				
				const teamId = this.getCurrentNodeParameter('teamId') as string;

				const databases = await apiRequest.call(
					this,
					'GET',
					'/teams/'+teamId+'/databases',
					{},
					{},
				);
				const returnData = (databases as IDataObject[]).map((o) => ({
					name: o.name as string,
					value: o.id as string,
				})) as INodePropertyOptions[];
				return returnData;
			},
			async getTables(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				
				const teamId = this.getCurrentNodeParameter('teamId') as string;
				const databaseId = this.getCurrentNodeParameter('databaseId') as string;

				const tables = await apiRequest.call(
					this,
					'GET',
					'/teams/'+teamId+'/databases/'+databaseId+'/tables',
					{},
					{},
				);
				const returnData = (tables as IDataObject[]).map((o) => ({
					name: o.name as string,
					value: o.id as string,
				})) as INodePropertyOptions[];
				return returnData;
			},
		},
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
