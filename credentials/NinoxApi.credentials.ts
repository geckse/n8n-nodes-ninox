import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NinoxApi implements ICredentialType {
	name = 'ninoxApi';
	displayName = 'Ninox API Credentials';
	documentationUrl = 'https://docs.ninox.com/de/altes-handbuch/ninox-api/ninox-rest-api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'token',
			type: 'string',
			default: '',
		}
	];

	authenticate = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.token}}',
			},
		},
	} as IAuthenticateGeneric;

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.ninoxdb.de/v1',
			url: '/teams',
		},
	};
}
