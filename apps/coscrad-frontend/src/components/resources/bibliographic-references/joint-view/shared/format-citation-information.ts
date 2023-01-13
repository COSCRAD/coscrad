import { isNullOrUndefined } from '@coscrad/validation-constraints';

const formatDateInformation = (dateInformation: string): string =>
    isNullOrUndefined(dateInformation) ? '' : `(${dateInformation})`;

export const formatCitationInformation = (
    valuesToCommaSeparate: string[],
    dateInformation: string
): string =>
    `${valuesToCommaSeparate
        .filter((value) => value !== null && typeof value !== undefined)
        .join(',')} ${formatDateInformation(dateInformation)}`;
