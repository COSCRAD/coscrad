import { BibliographicReferenceType } from '../bibliographic-reference-type.enum';
import { IBibliographicReferenceCreator } from './bibliographic-reference-creator.interface';

export interface IBookBibliographicReferenceData {
    type: BibliographicReferenceType.book;
    title: string;
    creators: IBibliographicReferenceCreator[];
    abstract?: string;
    year?: number;
    publisher?: string;
    place?: string;
    url?: string;
    numberOfPages?: number;
    isbn?: string;
}
