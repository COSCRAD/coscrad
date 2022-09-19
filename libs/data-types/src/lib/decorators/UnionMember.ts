import { COSCRAD_UNION_MEMBER_METADATA } from '../constants';

export function UnionMember(discriminantValue: string): ClassDecorator {
    return (target: Object): void => {
        Reflect.defineMetadata(
            COSCRAD_UNION_MEMBER_METADATA,
            {
                discriminantValue,
            },
            target
        );
    };
}
