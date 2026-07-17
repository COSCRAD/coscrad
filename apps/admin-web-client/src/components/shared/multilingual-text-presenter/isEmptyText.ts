import { isNullOrUndefined } from '@coscrad/validation-constraints';

// TODO Consider moving this to `@coscrad/validation-constraints`
export const isEmptyText = (input: string | null | undefined): boolean =>
    isNullOrUndefined(input) || input === '';
