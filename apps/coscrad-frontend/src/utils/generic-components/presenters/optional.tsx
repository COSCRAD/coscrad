import { ReactNode } from 'react';

interface OptionalComponentProps<T = unknown> {
    children: ReactNode;
    predicateValue: T;
}

const emptyValues = [null, undefined, ''];

type EmptyValue = typeof emptyValues[number];

export const Optional = ({
    children,
    predicateValue: value,
}: OptionalComponentProps): JSX.Element => {
    if (emptyValues.includes(value as EmptyValue)) return null;

    return <div>{children}</div>;
};
