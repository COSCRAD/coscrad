import { ICoscradModelSchema } from './coscrad-model-schema';

export interface IUnionMemberSchemaDefinition {
    discriminant: string;
    schema: ICoscradModelSchema;
}

export interface ICoscradUnionDataTypeDefinition {
    complexDataType: 'UNION';
    discriminantPath: string;
    schemaDefinitions: IUnionMemberSchemaDefinition[];
}
