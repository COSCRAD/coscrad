import { COSCRAD_UNION_MEMBER_METADATA } from '../constants';

/**
 * This decorator factory function allows you to register the value of the
 * discriminant that distinguishes it from other members of a discriminated union.
 * This will only take effect if the target class is referenced in the
 * `@Union(...)` decorator, and should be the value of the property specified
 * there via the `discriminantPath`.
 */
export function DiscriminatedBy(discriminantValue: string): ClassDecorator {
    return (target: Object): void => {
        Reflect.defineMetadata(
            COSCRAD_UNION_MEMBER_METADATA,
            {
                discriminantValue,
            },
            target
        );
    };
}
