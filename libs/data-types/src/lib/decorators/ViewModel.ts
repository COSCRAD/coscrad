import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import { getCoscradDataSchema } from '../utilities';
import getCoscradDataSchemaFromPrototype from '../utilities/getCoscradDataSchemaFromPrototype';

export function ViewModel(DomainModelDataClass: Object): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const fullDataSchema = getCoscradDataSchema(DomainModelDataClass);

        const dataSchemaForProp = fullDataSchema[propertyKey];

        // TODO Make this a custom exception class instance
        if (dataSchemaForProp === null || typeof dataSchemaForProp === 'undefined')
            throw new Error(
                // manually box the prop as String in case it is a symbol
                `Failed to find a corresponding domain model schema definition for property: ${String(
                    propertyKey
                )} of view model: ${target.constructor.name}`
            );

        // Get existing schema metadata for this view model
        const existingMeta = getCoscradDataSchemaFromPrototype(target);

        Reflect.defineMetadata(
            COSCRAD_DATA_TYPE_METADATA,
            { ...existingMeta, [propertyKey]: dataSchemaForProp },
            target
        );
    };
}
