import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
import { TermAddedToVocabularyList } from './term-added-to-vocabulary-list.event';

@CoscradEventConsumer('TERM_ADDED_TO_VOCABULARY_LIST')
export class TermAddedToVocabularyListEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IVocabularyListQueryRepository
    ) {}

    async handle({
        payload: {
            termId,
            aggregateCompositeIdentifier: { id: vocabularyListId },
        },
    }: TermAddedToVocabularyList): Promise<void> {
        await this.queryRepository.addTerm(vocabularyListId, termId);
    }
}
