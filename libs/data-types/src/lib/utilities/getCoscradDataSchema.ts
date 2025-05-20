import { UnionDataTypeDefinition } from '../types';
import { ClassSchema } from '../types/ClassSchema';
import getCoscradDataSchemaFromPrototype from './getCoscradDataSchemaFromPrototype';

export interface UnionFinderService {
    find(name: string): UnionDataTypeDefinition;
}

// eslint-disable-next-line
export default (TargetClass: Object): ClassSchema<Record<string, unknown>> => {
    if (!TargetClass) {
        // TODO Should we throw here?
        return {};
    }

    // @ts-expect-error TODO: restrict argument to be a class
    return getCoscradDataSchemaFromPrototype(TargetClass.prototype || {});
};
