import { IsNonEmptyObject } from '@coscrad/validation';
import { CoscradDataType } from '../types/CoscradDataType';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';
import WithValidation from './validation/WithValidation';

/**
 * `RawData` is intended to be used with `CREATE` command payloads \ DTOs. This
 * allows us to track historical data from imports and opt-in later with event-sourcing.
 *
 * `Raw Data` is not meant to be used in the schema for an object that is returned to
 * the user.
 */
export function RawDataObject(userOptions: Partial<TypeDecoratorOptions> = {}): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        WithValidation(IsNonEmptyObject(), options)(target, propertyKey);

        appendMetadata(target, propertyKey, CoscradDataType.RawData, options);
    };
}
