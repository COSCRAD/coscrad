import { ClassSchema } from '../types/ClassSchema';
import getCoscradDataSchemaFromPrototype from './getCoscradDataSchemaFromPrototype';

// eslint-disable-next-line
export default (TargetClass: Object): ClassSchema<Record<string, unknown>> =>
    // @ts-expect-error TODO: restrict argument to be a class
    getCoscradDataSchemaFromPrototype(TargetClass.prototype || {});
