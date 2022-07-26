export enum BibliographicReferenceType {
    book = 'book',
    journalArticle = 'journalArticle',
    courtCase = 'courtCase',
}

export const isBibliographicReferenceType = (input: unknown): input is BibliographicReferenceType =>
    Object.values(BibliographicReferenceType).includes(input as BibliographicReferenceType);
