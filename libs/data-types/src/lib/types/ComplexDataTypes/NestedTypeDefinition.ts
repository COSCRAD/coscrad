import { ClassSchema } from '../ClassSchema';
import { ComplexCoscradDataType } from './ComplexCoscradDataType';

export type NestedTypeDefinition = {
    complexDataType: ComplexCoscradDataType.nested;
    schema: ClassSchema;
};
