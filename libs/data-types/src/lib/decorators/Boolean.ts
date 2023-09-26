import { CoscradDataType } from '../types';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types';

// we have named this deorator to avoid collisions with the wrapper class Boolean
export function BooleanDataType(userOptions: TypeDecoratorOptions): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        appendMetadata(target, propertyKey, CoscradDataType.Boolean, options);
    };
}
