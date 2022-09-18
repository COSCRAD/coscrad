import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import { getCoscradDataSchema } from '../utilities';
import getCoscradDataSchemaFromPrototype from '../utilities/getCoscradDataSchemaFromPrototype';

/**
 * This decorator is to be used to decorate view model proeprties that are simply
 * "carried across" from the corresponding domain model. This allows us to maintain
 * a single source of truth for these properties' data types, while still decoupling
 * the view models from the domain models.
 *
 * In the future, we may want to provide flexibility to rename the proeprty on the
 * view model.
 */
export function FromDomainModel(DomainModelDataClass: Object): PropertyDecorator {
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
