import { INodeListSearchItems, INodeParameterResourceLocator, INodeListSearchResult, ILoadOptionsFunctions } from "n8n-workflow";
import { apiRequest } from "../transport";

export async function getTeams(
    this: ILoadOptionsFunctions,
    filter?: string,
): Promise<INodeListSearchResult> {
    const teams = await apiRequest.call(
        this,
        'GET',
        '/teams',
        {},
        {},
    ) as Array<{ id: string; name: string }>;
    const results: INodeListSearchItems[] = teams
        // @ts-ignore
        .map((c) => ({
            name: c.name,
            value: c.id,
        }))
        .filter(
            (c) =>
                !filter ||
                c.name.toLowerCase().includes(filter.toLowerCase()) ||
                c.value?.toString() === filter,
        )
        .sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
        });
    return { results };
};

export async function getDatabases(
    this: ILoadOptionsFunctions,
    filter?: string,
): Promise<INodeListSearchResult> {

    const teamId = (this.getCurrentNodeParameter('teamId') as INodeParameterResourceLocator).value;
    
    console.log('teamId', this.getCurrentNodeParameter('teamId'));

    const databases = await apiRequest.call(
        this,
        'GET',
        '/teams/' + teamId + '/databases',
        {},
        {},
    ) as Array<{ id: string; name: string }>;
    const results: INodeListSearchItems[] = databases
        // @ts-ignore
        .map((c) => ({
            name: c.name,
            value: c.id,
        }))
        .filter(
            (c) =>
                !filter ||
                c.name.toLowerCase().includes(filter.toLowerCase()) ||
                c.value?.toString() === filter,
        )
        .sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
        });
    return { results };
};

export async function getTables(
    this: ILoadOptionsFunctions,
    filter?: string,
): Promise<INodeListSearchResult> {

    const teamId = (this.getCurrentNodeParameter('teamId') as INodeParameterResourceLocator).value;
    const databaseId = (this.getCurrentNodeParameter('databaseId') as INodeParameterResourceLocator).value;

    const tables = await apiRequest.call(
        this,
        'GET',
        '/teams/' + teamId + '/databases/' + databaseId + '/tables',
        {},
        {},
    ) as Array<{ id: string; name: string }>;
    const results: INodeListSearchItems[] = tables
        // @ts-ignore
        .map((c) => ({
            name: c.name,
            value: c.id,
        }))
        .filter(
            (c) =>
                !filter ||
                c.name.toLowerCase().includes(filter.toLowerCase()) ||
                c.value?.toString() === filter,
        )
        .sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
        });
    return { results };
};