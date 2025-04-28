import { Inject } from '@nestjs/common';

import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../../term/queries';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
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
        private readonly termQueryRepository: ITermQueryRepository,
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly vocabularyListQueryRepository: IVocabularyListQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: vocabularyListId },
            termId,
        },
    }: TermAddedToVocabularyList): Promise<void> {
        const vlView = await this.vocabularyListQueryRepository.fetchById(vocabularyListId);

        console.log({
            vlView,
            termId,
            vocabularyListId,
        });

        if (isNotFound(vlView)) {
            return;
        }

        const { name: vocabularyListName } = vlView;

        console.log(`calling repository to index: ${vocabularyListName} on term: ${termId}`);
        await this.termQueryRepository.indexVocabularyList(
            termId,
            vocabularyListId,
            new MultilingualText(vocabularyListName)
        );
    }
}
