import { BibliographicReferenceType } from '../bibliographic-reference-type.enum';
import { IBibliographicReferenceCreator } from './bibliographic-reference-creator.interface';

export interface IJournalArticleBibliographicReferenceData {
    type: BibliographicReferenceType.journalArticle;
    title: string;
    creators: IBibliographicReferenceCreator[];
    abstract?: string;
    issueDate: string;
    publicationTitle?: string;
    url?: string;
    issn?: string;
    doi?: string;
}
