import { IDataObject, INodePropertyOptions, ILoadOptionsFunctions } from "n8n-workflow";
import { apiRequest } from "../transport";

export async function getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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
    const returnData = (databases as IDataObject[]).map((o) => ({
        name: o.name as string,
        value: o.id as string,
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
    const returnData = (tables as IDataObject[]).map((o) => ({
        name: o.name as string,
        value: o.id as string,
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
    const returnData = (fields as IDataObject[]).map((o) => ({
        name: o.name as string,
        value: o.id as string,
    })) as INodePropertyOptions[];
    return returnData;
};