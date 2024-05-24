import { ClassSchema } from '../ClassSchema';
import { ComplexCoscradDataType } from './ComplexCoscradDataType';

export type NestedTypeDefinition = {
    name: string;
    complexDataType: ComplexCoscradDataType.nested;
    schema: ClassSchema;
};
