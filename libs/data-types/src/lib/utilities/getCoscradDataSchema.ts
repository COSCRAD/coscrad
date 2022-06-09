import { ClassDataTypeMetadata } from '../types/ClassDataTypeMetadata';
import getCoscradDataSchemeaFromPrototype from './getCoscradDataSchemeaFromPrototype';

// eslint-disable-next-line
export default (TargetClass: Object): ClassDataTypeMetadata =>
    // @ts-expect-error TODO: restrict argument to be a class
    getCoscradDataSchemeaFromPrototype(TargetClass.prototype || {});
