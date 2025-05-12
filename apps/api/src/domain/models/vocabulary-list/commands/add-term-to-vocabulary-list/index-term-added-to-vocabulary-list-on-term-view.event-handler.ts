import { Inject } from '@nestjs/common';

import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../../term/queries';
import { TermAddedToVocabularyList } from './term-added-to-vocabulary-list.event';

/**
 * This is different from the `TermAddedToVocabularyListHandler` in that here
 * we update the view for the corresponding term. We could've done this atomically
 * in the other handler, but we wanted to experiment
 * with multiple consumers. Note that eventual consistency is not a problem here
 * because making the vocabulary lists a term appears in known in term views
 * is an enhancement, but the vocabulary list view is the source of truth for
 * which terms are contained as entries.
 */
@CoscradEventConsumer('TERM_ADDED_TO_VOCABULARY_LIST')
export class IndexTermAddedToVocabularyListOnTermViewEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN)
        private readonly termQueryRepository: ITermQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: vocabularyListId },
            termId,
        },
    }: TermAddedToVocabularyList): Promise<void> {
        await this.termQueryRepository.indexVocabularyList(termId, vocabularyListId);
    }
}
