import { INodePropertyOptions, ILoadOptionsFunctions } from "n8n-workflow";
import { apiRequest } from "../transport";

export async function getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const teams = await apiRequest.call(
        this,
        'GET',
        '/teams',
        {},
        {},
    );
    // @ts-ignore
    const returnData = teams.map((o) => ({
        name: o.name,
        value: o.id,
    })) as INodePropertyOptions[];
    return returnData;
};

export async function getDatabases(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

    const teamId = this.getCurrentNodeParameter('teamId') as string;

    const databases = await apiRequest.call(
        this,
        'GET',
        '/teams/' + teamId + '/databases',
        {},
        {},
    );
    // @ts-ignore
    const returnData = databases.map((o) => ({
        name: o.name,
        value: o.id,
    })) as INodePropertyOptions[];
    return returnData;
};

export async function getTables(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

    const teamId = this.getCurrentNodeParameter('teamId') as string;
    const databaseId = this.getCurrentNodeParameter('databaseId') as string;

    const tables = await apiRequest.call(
        this,
        'GET',
        '/teams/' + teamId + '/databases/' + databaseId + '/tables',
        {},
        {},
    );
    // @ts-ignore
    const returnData = tables.map((o) => ({
        name: o.name,
        value: o.id,
    })) as INodePropertyOptions[];
    return returnData;
};

export async function getFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const teamId = this.getCurrentNodeParameter('teamId') as string;
    const databaseId = this.getCurrentNodeParameter('databaseId') as string;
    const tableId = this.getCurrentNodeParameter('tableId') as string;
    
    const fields = await apiRequest.call(
        this,
        'GET',
        '/teams/' + teamId + '/databases/' + databaseId + '/tables/' + tableId + '',
        {},
        {},
    );
    // @ts-ignore
    const returnData = fields.map((o) => ({
        name: o.name,
        value: o.id,
    })) as INodePropertyOptions[];
    return returnData;
};