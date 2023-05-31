import { CoscradComplexDataType } from './coscrad-complex-data-type.enum';
import { ICoscradModelSchema } from './coscrad-model-schema';

export interface IUnionMemberSchemaDefinition {
    discriminant: string;
    schema: ICoscradModelSchema;
}

export interface ICoscradUnionDataTypeDefinition {
    complexDataType: CoscradComplexDataType.union;
    discriminantPath: string;
    schemaDefinitions: IUnionMemberSchemaDefinition[];
    unionName: string;
}
