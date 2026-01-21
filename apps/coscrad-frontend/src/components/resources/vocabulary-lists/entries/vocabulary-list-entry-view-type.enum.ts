export enum VocabularyListEntryViewType {
    Carousel = `Carousel`,
    Table = `Table`,
}

export const isVocabularyListEntryViewType = (
    input: unknown
): input is VocabularyListEntryViewType =>
    Object.values(VocabularyListEntryViewType).includes(input as VocabularyListEntryViewType);
