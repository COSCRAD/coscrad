import { ComplexCoscradDataType, UnionDataTypeDefinition } from '../types';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

export const UNION_METADATA = '__UNION_METADATA__';

export type UnionMetadata = {
    unionName: string;
    discriminantPath: string;
};

export const NotTaggedAsUnion = Symbol('this property has not been annotated as a union');

export type NotTaggedAsUnion = typeof NotTaggedAsUnion;

export const getUnionMetadata = (target: Object): UnionMetadata | NotTaggedAsUnion => {
    /**
     * Note that the target of a property decorator is the class constructor's prototype.
     * This is in distinction to a class decorator, whose target is the class
     * constructor itself (at least for instance properties).
     */
    // @ts-expect-error fix me
    const metadata = Reflect.getMetadata(UNION_METADATA, target.prototype);

    if (metadata === null || typeof metadata === 'undefined') return NotTaggedAsUnion;

    return metadata as UnionMetadata;
};

export const isUnionMetadata = (input: NotTaggedAsUnion | UnionMetadata): input is UnionMetadata =>
    input !== NotTaggedAsUnion;

export function Union2(
    unionName: string,
    discriminantPath: string,
    userOptions: TypeDecoratorOptions
): PropertyDecorator {
    const options = mixinDefaultTypeDecoratorOptions(userOptions);

    return (target: Object, propertyKey: string | symbol) => {
        const meta: UnionMetadata = {
            unionName,
            discriminantPath,
        };

        Reflect.defineMetadata(UNION_METADATA, meta, target);

        const _foo = Reflect.getMetadata(UNION_METADATA, target);

        const unionDataTypeDefinition: UnionDataTypeDefinition = {
            complexDataType: ComplexCoscradDataType.union,
            discriminantPath,
            // TODO remove this property
            schemaDefinitions: [],
        };

        appendMetadata(target, propertyKey, unionDataTypeDefinition, options);
    };
}
