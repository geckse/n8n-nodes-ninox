import { apiRequest } from "../transport";
import { ResourceMapperFields, ILoadOptionsFunctions, ResourceMapperField, FieldType } from "n8n-workflow";

type TypesMap = Partial<Record<FieldType, string[]>>;

const ninoxTypesMap: TypesMap = {
	string: ['text', 'multilineText', 'richText', 'email', 'phoneNumber', 'url', 'choice'],
	number: ['rating', 'percent', 'number', 'duration', 'currency'],
	boolean: ['boolean'],
	dateTime: ['dateTime', 'date'],
	time: ['duration'],
	object: ['json'],
	array: ['array'],
};

function mapForeignType(foreignType: string, typesMap: TypesMap): FieldType {
	let type: FieldType = 'string';

	for (const nativeType of Object.keys(typesMap)) {
		const mappedForeignTypes = typesMap[nativeType as FieldType];

		if (mappedForeignTypes?.includes(foreignType)) {
			type = nativeType as FieldType;
			break;
		}
	}

	return type;
}

export async function getFields(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
    const teamId = this.getCurrentNodeParameter('teamId', { extractValue: true }) as string;
    const databaseId = this.getCurrentNodeParameter('databaseId', { extractValue: true }) as string;
    const tableId = this.getCurrentNodeParameter('tableId', { extractValue: true }) as string;

    const fields = await apiRequest.call(
        this,
        'GET',
        '/teams/' + teamId + '/databases/' + databaseId + '/tables/' + tableId + '',
    );

    const resourceFields: ResourceMapperField[] = (fields.fields || fields).map((o: any) => ({
        id: o.id,
        displayName: o.name,
        required: false,
        defaultMatch: o.id === 'id',
        display: true,
        type: mapForeignType(o.type, ninoxTypesMap) || 'string',
        canBeUsedToMatch: o.id === 'id',
    }));

    console.log('resourceFields', resourceFields);

    return { fields: resourceFields };
}