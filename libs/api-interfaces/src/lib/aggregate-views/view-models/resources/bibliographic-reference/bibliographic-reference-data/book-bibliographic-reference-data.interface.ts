import { BibliographicReferenceType } from '../bibliographic-reference-type.enum';

export interface IBookBibliographicReferenceData {
    type: BibliographicReferenceType.book;
    title: string;
    creators: unknown[];
    abstract?: string;
    year?: number;
    publisher?: string;
    place?: string;
    url?: string;
    numberOfPages?: number;
    isbn?: string;
}
