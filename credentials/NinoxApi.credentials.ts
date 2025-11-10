import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class NinoxApi implements ICredentialType {
	name = 'ninoxApi';
	displayName = 'Ninox API Credentials API';
	documentationUrl = 'https://docs.ninox.com/en/api/introduction#obtaining-a-personal-access-token';
	icon: Icon = 'file:ninox.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'token',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Custom Base URL',
			description: 'Whether to use the public cloud API or defining a custom base URL for private cloud or on-premise installations.',
			hint: 'if you are using the Ninox private cloud or on-premise installation, you need to define the base URL of your Ninox.',
			name: 'customBaseUrl',
			type: 'boolean',
			default: false,
		},
		{
			displayName: 'Base URL',
			description: 'The base URL to use for private cloud or on-premise installations. Do nut end with trailing slash. ("/")',
			hint: 'e.g: https://mycompany.ninox.com/v1 or https://ninox.mycompany.com/v1',
			name: 'baseUrl',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					customBaseUrl: [
						true,
					],
				},
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.token}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ !$credentials.customBaseUrl ? "https://api.ninox.com/v1" : $credentials.baseUrl}}',
			url: '/teams',
		},
	};
}
