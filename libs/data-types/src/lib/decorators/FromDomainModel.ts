import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import { NoSchemaFoundForDomainModelReferencedByViewModelException } from '../exceptions/NoSchemaFoundForDomainModelReerencedByViewModel';
import { getCoscradDataSchema } from '../utilities';
import getCoscradDataSchemaFromPrototype, {
    Ctor,
} from '../utilities/getCoscradDataSchemaFromPrototype';

/**
 * This decorator is to be used to decorate view model properties that are simply
 * "carried across" from the corresponding domain model. This allows us to maintain
 * a single source of truth for these properties' data types, while still decoupling
 * the view models from the domain models.
 *
 * In the future, we may want to provide flexibility to rename the property on the
 * view model.
 */
export function FromDomainModel<T extends Ctor<unknown>>(
    DomainModelCtor: T,
    // TODO Constrain this to be a keyof an instance of the given class
    propertyKeyOverride?: keyof InstanceType<T>
): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        const fullDataSchemaForDomainModel = getCoscradDataSchema(DomainModelCtor);

        const dataSchemaForPropInDomainModel =
            /**
             * To improve on the types here, we need to make getCoscradDataSchema generic.
             */
            fullDataSchemaForDomainModel[(propertyKeyOverride || propertyKey) as string];

        if (
            dataSchemaForPropInDomainModel === null ||
            typeof dataSchemaForPropInDomainModel === 'undefined'
        )
            throw new NoSchemaFoundForDomainModelReferencedByViewModelException(
                target,
                propertyKey
            );

        // Get existing schema metadata for this view model
        const existingMetaForViewModel = getCoscradDataSchemaFromPrototype(target);

        Reflect.defineMetadata(
            COSCRAD_DATA_TYPE_METADATA,
            { ...existingMetaForViewModel, [propertyKey]: dataSchemaForPropInDomainModel },
            target
        );
    };
}
