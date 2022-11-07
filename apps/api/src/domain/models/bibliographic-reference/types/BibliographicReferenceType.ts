import { BibliographicReferenceType } from '@coscrad/api-interfaces';

export { BibliographicReferenceType };

export const isBibliographicReferenceType = (input: unknown): input is BibliographicReferenceType =>
    Object.values(BibliographicReferenceType).includes(input as BibliographicReferenceType);
