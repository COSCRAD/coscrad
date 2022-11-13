import { IBaseViewModel } from '@coscrad/api-interfaces';

export type HeadingLabel<T extends IBaseViewModel> = {
    propertyKey: keyof T;
    headingLabel: string;
};
