import { HasId } from '@coscrad/api-interfaces';

export type HeadingLabel<T extends HasId> = {
    propertyKey: keyof T;
    headingLabel: string;
};
