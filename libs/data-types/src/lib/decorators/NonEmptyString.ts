import 'reflect-metadata';
import CoscradDataType from '../types/CoscradDataType';
import appendMetadata from '../utilities/appendMetadata';

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

    // Object is ok as a type in this case
    // eslint-disable-next-line
    return (target: Object, propertyKey: string | symbol) => {
        appendMetadata(target, propertyKey, CoscradDataType.NonEmptyString, { isOptional });
    };
}
