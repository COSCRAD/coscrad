export const isUnionClassMetadata = (input: unknown): input is UnionClassMetadata =>
    typeof (input as UnionClassMetadata)?.discriminantValue === 'string';

export type UnionClassMetadata = {
    discriminantValue: string;
};
