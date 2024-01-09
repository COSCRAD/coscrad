import { UnionDataTypeDefinition } from '../types';
import { ClassSchema } from '../types/ClassSchema';
import getCoscradDataSchemaFromPrototype from './getCoscradDataSchemaFromPrototype';

export interface UnionFinderService {
    find(name: string): UnionDataTypeDefinition;
}

// eslint-disable-next-line
export default (TargetClass: Object): ClassSchema<Record<string, unknown>> =>
    // @ts-expect-error TODO: restrict argument to be a class
    getCoscradDataSchemaFromPrototype(TargetClass?.prototype || {});
