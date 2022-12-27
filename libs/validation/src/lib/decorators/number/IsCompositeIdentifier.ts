import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

/**
 * TODO[https://www.pivotaltracker.com/story/show/182694263]
 * Make the following should probably be part of our types lib.
 */
export type CompositeIdentifier<TAllowedTypes = string, UIdType = string> = {
    type: TAllowedTypes;

    id: UIdType;
};

export type TypeGuard<U> = (input: unknown) => input is U;

export const isCompositeIdentifier = <TAllowedType extends string, UIdType = string>(
    AllowedTypesEnum: Record<string, TAllowedType>,
    idTypeGuard: TypeGuard<UIdType>,
    input: unknown
): input is CompositeIdentifier<TAllowedType> => {
    if (input === null) return false;

    if (typeof input === 'undefined') return false;

    const { type, id } = input as CompositeIdentifier<TAllowedType, UIdType>;

    if (!Object.values(AllowedTypesEnum).includes(type)) return false;

    if (!idTypeGuard(id)) return false;

    return true;
};

export function IsCompositeIdentifier<TIdType extends string | number>(
    AllowedTypesEnum: Record<string, string>,
    idTypeGuard: TypeGuard<TIdType>,
    validationOptions?: ValidationOptions
) {
    return ValidateBy(
        {
            name: isCompositeIdentifier.name,
            validator: {
                validate: (value, _): boolean =>
                    isCompositeIdentifier(AllowedTypesEnum, idTypeGuard, value),
                defaultMessage: buildMessage(
                    (eachPrefix) => eachPrefix + '$property must be a composite identifier',
                    validationOptions
                ),
            },
        },
        validationOptions
    );
}
