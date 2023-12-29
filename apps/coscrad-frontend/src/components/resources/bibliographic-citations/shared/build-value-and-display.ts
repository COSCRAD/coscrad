import { IValueAndDisplay } from '@coscrad/api-interfaces';

export const buildValueAndDisplay = <T>([value, display]: [T, string]): IValueAndDisplay<T> => ({
    value,
    display,
});
