import { ClassSchema } from '../ClassSchema';
import { ComplexCoscradDataType } from './ComplexCoscradDataType';

export type NestedTypeDefinition = {
    type: ComplexCoscradDataType.nested;
    schema: ClassSchema;
};
