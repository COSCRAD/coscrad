import { isInteger } from '@coscrad/validation-constraints';

export const buildDummyUuid = (sequenceNumber: number): string => {
    if (!isInteger(sequenceNumber) || sequenceNumber < 1) {
        throw new Error(`Invalid sequential ID number: ${sequenceNumber}`);
    }

    if (sequenceNumber > 999) {
        throw new Error(
            `Invalid sequential ID number (must be less than a thousand): ${sequenceNumber}`
        );
    }

    const sequenceNumberAsString = sequenceNumber.toString();

    const numberOfFillerZeros = 3 - sequenceNumberAsString.length;

    const sequenceNumberAsStringWithLeadingZeroes = '0'
        .repeat(numberOfFillerZeros)
        .concat(sequenceNumberAsString);

    return `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100${sequenceNumberAsStringWithLeadingZeroes}`;
};
