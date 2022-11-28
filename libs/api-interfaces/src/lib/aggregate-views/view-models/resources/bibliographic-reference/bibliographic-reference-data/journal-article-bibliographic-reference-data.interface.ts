import { BibliographicReferenceType } from '../bibliographic-reference-type.enum';

export interface IJournalArticleBibliographicReferenceData {
    type: BibliographicReferenceType.journalArticle;
    title: string;
    creators: unknown[];
    abstract?: string;
    issueDate: string;
    publicationTitle?: string;
    url?: string;
    issn?: string;
    doi?: string;
}
