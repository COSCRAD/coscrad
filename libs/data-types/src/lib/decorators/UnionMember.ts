export type DiscriminantValue = string | number;

export const UNION_MEMBER_METADATA = '__UNION_MEMBER_META__';

export type UnionMemberMetadata = {
    unionName: string;
    discriminant: DiscriminantValue;
    ctor: Object;
};

export const NotTaggedAsUnionMember = Symbol(
    'this object has not been annotated as the member of a union type'
);

export type NotTaggedAsUnionMember = typeof NotTaggedAsUnionMember;

export const getUnionMemberMetadata = (
    target: Object
): UnionMemberMetadata | NotTaggedAsUnionMember => {
    const metadata = Reflect.getMetadata(UNION_MEMBER_METADATA, target);

    if (metadata === null || typeof metadata === 'undefined') return NotTaggedAsUnionMember;

    return metadata as UnionMemberMetadata;
};

export const isUnionMemberMetadata = (
    input: NotTaggedAsUnionMember | UnionMemberMetadata
): input is UnionMemberMetadata => input !== NotTaggedAsUnionMember;

/**
 *
 * @param unionName the name of the union type of which this class represents one member
 * @param discriminantValue the value of the discriminant that marks this sub-type (e.g. widget as in `type=widget`)- the discriminant path is specified on the @Union
 * @returns class decorator that can be used to annotate your class as a member of a discriminated union type
 */
export function UnionMember(
    unionName: string,
    discriminantValue: DiscriminantValue
): ClassDecorator {
    return (target: Object) => {
        const meta: UnionMemberMetadata = {
            unionName,
            discriminant: discriminantValue,
            ctor: target,
        };

        Reflect.defineMetadata(UNION_MEMBER_METADATA, meta, target);
    };
}
