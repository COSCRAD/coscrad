import { CoscradComplexDataType } from './coscrad-complex-data-type.enum';
import { ICoscradModelSchema } from './coscrad-model-schema';

export interface ICoscradNestedTypeDefinition {
    complexDataType: CoscradComplexDataType.nested;
    schema: ICoscradModelSchema;
}
