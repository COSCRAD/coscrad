export const MULTILINGUAL_TEXT_METADATA = '__MULTILINGUAL_TEXT__';

export const getMultilingualTextFields = (target: object): string[] => {
    // @ts-expect-error TODO fix this
    const meta = Reflect.getMetadata(MULTILINGUAL_TEXT_METADATA, target.prototype || {});

    return meta?.fields || [];
};

export const MultilingualTextField = (): PropertyDecorator => {
    return function (target: object, propertyKey: string | symbol) {
        const existing = Reflect.getMetadata(MULTILINGUAL_TEXT_METADATA, target);

        const existingFields = existing?.fields || [];

        existingFields.push(propertyKey);

        Reflect.defineMetadata(
            MULTILINGUAL_TEXT_METADATA,
            {
                // avoid duplicates
                fields: Array.from(new Set(existingFields)),
            },
            target
        );
    };
};
