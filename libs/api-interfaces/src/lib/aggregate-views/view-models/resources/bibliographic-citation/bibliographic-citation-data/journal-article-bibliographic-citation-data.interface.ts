import { BibliographicCitationType } from '../bibliographic-citation-type.enum';
import { IBibliographicCitationCreator } from './bibliographic-citation-creator.interface';

export interface IJournalArticleBibliographicCitationData {
    type: BibliographicCitationType.journalArticle;
    title: string;
    creators: IBibliographicCitationCreator[];
    abstract?: string;
    issueDate: string;
    publicationTitle?: string;
    url?: string;
    issn?: string;
    doi?: string;
}
