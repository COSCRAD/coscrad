import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateJournalArticleBibliographicCitation } from './create-journal-article-bibliographic-citation.command';

export type JournalArticleBibliographicCitationCreatedPayload =
    CreateJournalArticleBibliographicCitation;

export class JournalArticleBibliographicCitationCreated extends BaseEvent<JournalArticleBibliographicCitationCreatedPayload> {
    readonly type = 'JOURNAL_ARTICLE_BIBLIOGRAPHIC_CITATION_CREATED';
}
