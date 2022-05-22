export enum BibliographicReferenceType {
    book = 'Book',
    journalArticle = 'JournalArticle',
}

export const isBibliographicReferenceType = (input: unknown): input is BibliographicReferenceType =>
    Object.values(BibliographicReferenceType).includes(input as BibliographicReferenceType);
