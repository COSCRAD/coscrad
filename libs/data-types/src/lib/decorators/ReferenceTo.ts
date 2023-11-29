import { isNonEmptyString } from '@coscrad/validation-constraints';
import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import getCoscradDataSchemaFromPrototype from '../utilities/getCoscradDataSchemaFromPrototype';

export const COMPOSITE_IDENTIFIER = '_COMPOSITE_IDENTIFIER_';

function Reference(aggregateType?: string): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        const existingMeta = getCoscradDataSchemaFromPrototype(target);

        const existingMetaForThisProp = existingMeta[propertyKey] || {};

        Reflect.defineMetadata(
            COSCRAD_DATA_TYPE_METADATA,
            {
                ...existingMeta,
                [propertyKey]: {
                    ...existingMetaForThisProp,
                    referenceTo: isNonEmptyString(aggregateType)
                        ? aggregateType
                        : COMPOSITE_IDENTIFIER,
                },
            },
            target
        );
    };
}

/**
 * A full reference is achieved via a composite identifier of the form
 * ```ts
 * {
 *      type: string,
 *      id: string
 * }
 * ```
 * and includes not only the ID, but also a type (e.g. collection \ table in the
 * database layer, aggregate type in the domain, view type in the view layer).
 */
export function FullReference(): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        Reference()(target, propertyKey);
    };
}

/**
 * Use this for a direct reference to an id (uuid) on a schema. For composite
 * identifiers, use `@FullReference`.
 */
export function ReferenceTo(aggregateType: string): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        Reference(aggregateType)(target, propertyKey);
    };
}
