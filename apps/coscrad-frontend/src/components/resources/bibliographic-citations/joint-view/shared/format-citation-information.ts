import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';

const formatDateInformation = (dateInformation: string): string =>
    isNullOrUndefined(dateInformation) ? '' : `(${dateInformation})`;

export const formatCitationInformation = (
    valuesToCommaSeparate: string[],
    dateInformation: string
): string =>
    `${valuesToCommaSeparate
        .filter((value) => !isNullOrUndefined(value) && isNonEmptyString(value))
        .join(', ')} ${formatDateInformation(dateInformation)}`;
