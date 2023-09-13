import { ReactNode } from 'react';

interface OptionalComponentProps<T = unknown> {
    children: ReactNode;
    predicateValue: T;
}

const emptyValues = [null, undefined, '', false];

type EmptyValue = typeof emptyValues[number];

/**
 * @deprecated Until redesigned.
 *
 * We need to rework this API. Oftentimes, we don't want to even render the
 * children if the predicateValue is false, as we may end up "dotting into"
 * null along the way.
 */
export const Optional = ({
    children,
    predicateValue: value,
}: OptionalComponentProps): JSX.Element => {
    if (emptyValues.includes(value as EmptyValue)) return null;

    return <div>{children}</div>;
};
