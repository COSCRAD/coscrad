import { isStringWithNonzeroLength } from '@coscrad/validation';

export const isUnionClassMetadata = (input: unknown): input is UnionClassMetadata =>
    isStringWithNonzeroLength((input as UnionClassMetadata).discriminantValue);

export type UnionClassMetadata = {
    discriminantValue: string;
};
