import { COSCRAD_UNION_MEMBER_METADATA } from '../constants';
import { NoDiscriminantRegisteredForUnionModelException } from '../exceptions';
import { isUnionClassMetadata } from '../types';

export default (MemberClass: object): string => {
    const rawMetadata = Reflect.getMetadata(COSCRAD_UNION_MEMBER_METADATA, MemberClass);

    if (!isUnionClassMetadata(rawMetadata)) {
        throw new NoDiscriminantRegisteredForUnionModelException(MemberClass);
    }

    return rawMetadata.discriminantValue;
};
