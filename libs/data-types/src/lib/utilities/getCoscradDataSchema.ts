import { ClassDataTypeMetadata } from '../types/ClassDataTypeMetadata';
import getCoscradDataSchemaFromPrototype from './getCoscradDataSchemaFromPrototype';

// eslint-disable-next-line
export default (TargetClass: Object): ClassDataTypeMetadata =>
    // @ts-expect-error TODO: restrict argument to be a class
    getCoscradDataSchemaFromPrototype(TargetClass.prototype || {});
