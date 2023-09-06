export const UNION_METADATA = '__UNION_METADATA__';

export type UnionMetadata = {
    unionName: string;
    discriminantPath: string;
};

export const NotTaggedAsUnion = Symbol('this property has not been annotated as a union');

export type NotTaggedAsUnion = typeof NotTaggedAsUnion;

export const getUnionMetadata = (target: Object): UnionMetadata | NotTaggedAsUnion => {
    const metadata = Reflect.getMetadata(UNION_METADATA, target);

    if (metadata === null || typeof metadata === 'undefined') return NotTaggedAsUnion;

    return metadata as UnionMetadata;
};

export const isUnionMetadata = (input: NotTaggedAsUnion | UnionMetadata): input is UnionMetadata =>
    input !== NotTaggedAsUnion;

// Use this class decorator on an empty class definition to define a union data type
export function Union(unionName: string, discriminantPath: string): ClassDecorator {
    return (target: Object) => {
        const meta: UnionMetadata = {
            unionName,
            discriminantPath,
        };

        Reflect.defineMetadata(UNION_METADATA, meta, target);
    };
}
