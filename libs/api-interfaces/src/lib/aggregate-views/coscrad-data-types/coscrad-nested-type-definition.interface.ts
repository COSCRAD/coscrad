import { ICoscradModelSchema } from './coscrad-model-schema';

export interface ICoscradNestedTypeDefinition {
    complexDataType: 'NESTED';
    schema: ICoscradModelSchema;
}
