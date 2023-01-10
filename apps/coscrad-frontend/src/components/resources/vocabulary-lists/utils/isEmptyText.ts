import { isNullOrUndefined } from '@coscrad/validation-constraints';

// TODO Move to `@coscrad/validation-constraints`
export const isEmptyText = (input: string | null | undefined): boolean =>
    isNullOrUndefined(input) || input === '';
