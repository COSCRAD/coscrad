import 'reflect-metadata';

export const COSCRAD_DATA_TYPE_METADATA = '__coscrad-data-types__';

export const NON_EMPTY_STRING = 'NON_EMPTY_STRING';

type TypeDecoratorOptions = {
    isOptional: boolean;
};

const buildDefaultOptions = (): TypeDecoratorOptions => ({
    isOptional: false,
});

export function NonEmptyString(
    options: TypeDecoratorOptions = buildDefaultOptions()
): PropertyDecorator {
    const { isOptional } = options;

    // eslint-disable-next-line
    return (target: Object, propertyKey: string | symbol) => {
        const existingMeta = Reflect.getMetadata(COSCRAD_DATA_TYPE_METADATA, target);

        Reflect.defineMetadata(
            '__coscrad-data-types__',
            { ...existingMeta, [propertyKey]: { type: 'NON_EMPTY_STRING', isOptional } },
            target
        );
    };
}
