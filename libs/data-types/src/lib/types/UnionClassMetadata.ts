export const isUnionClassMetadata = (input: unknown): input is UnionClassMetadata =>
    typeof (input as UnionClassMetadata)?.discriminant === 'string';

export type UnionClassMetadata = {
    discriminant: string;
};
