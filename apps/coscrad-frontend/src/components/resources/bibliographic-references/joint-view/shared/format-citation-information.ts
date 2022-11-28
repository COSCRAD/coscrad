const formatDateInformation = (dateInformation: string): string =>
    dateInformation === null || typeof dateInformation === 'undefined'
        ? ''
        : `(${dateInformation})`;

export const formatCitationInfromation = (
    valuesToCommaSeparate: string[],
    dateInformation: string
): string =>
    `${valuesToCommaSeparate
        .filter((value) => value !== null && typeof value !== undefined)
        .join(',')} ${formatDateInformation(dateInformation)}`;
