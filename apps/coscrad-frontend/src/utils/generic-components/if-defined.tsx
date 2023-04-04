import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ReactNode } from 'react';

interface IfDefinedProps<T> {
    value: T;
    children: ReactNode;
}

export const IfDefined = <T,>({ value, children }: IfDefinedProps<T>): JSX.Element => {
    return <>{!isNullOrUndefined(value) && <div>{children}</div>}</>;
};
