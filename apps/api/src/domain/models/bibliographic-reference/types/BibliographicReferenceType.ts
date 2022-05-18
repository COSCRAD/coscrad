export enum BibliographicReferenceType {
    book = 'book',
}

export const isBibliographicReferenceType = (input: unknown): input is BibliographicReferenceType =>
    Object.values(BibliographicReferenceType).includes(input as BibliographicReferenceType);
