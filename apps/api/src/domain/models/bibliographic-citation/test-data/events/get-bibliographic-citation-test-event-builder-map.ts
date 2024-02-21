import { EventBuilder } from '../../../../../test-data/events';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { buildBookCreated, buildJournalArticleBibliographicCitationCreated } from './builders';

export const getBibliographicCitationTestEventBuilderMap = () =>
    new Map<string, EventBuilder<BaseEvent>>()
        .set('BOOK_BIBLIOGRAPHIC_CITATION_CREATED', buildBookCreated)
        .set(
            'JOURNAL_ARTICLE_BIBLIOGRAPHIC_CITATION_CREATED',
            buildJournalArticleBibliographicCitationCreated
        );
