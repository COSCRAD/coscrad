import { BibliographicCitationType } from '../bibliographic-citation-type.enum';
import { IBibliographicCitationCreator } from './bibliographic-citation-creator.interface';

export interface IBookBibliographicCitationData {
    type: BibliographicCitationType.book;
    title: string;
    creators: IBibliographicCitationCreator[];
    abstract?: string;
    year?: number;
    publisher?: string;
    place?: string;
    url?: string;
    numberOfPages?: number;
    isbn?: string;
}
