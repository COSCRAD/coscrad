import { Inject } from '@nestjs/common';

import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../../term/queries';
import { TermAddedToVocabularyList } from './term-added-to-vocabulary-list.event';

/**
 * This is different from the `TermAddedToVocabularyListHandler` in that here
 * we update the view for the corresponding term.
 *
 * We could've done this atomically in the other handler, but we wanted to experiment
 * with multiple consumers and we also wanted to be careful not to assume that
 * the terms and vocabulary lists share a database.
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
