import { ClassSchema } from '../types/ClassSchema';
import getCoscradDataSchemaFromPrototype from './getCoscradDataSchemaFromPrototype';

// eslint-disable-next-line
export default (TargetClass: Object): ClassSchema =>
    // @ts-expect-error TODO: restrict argument to be a class
    getCoscradDataSchemaFromPrototype(TargetClass.prototype || {});
