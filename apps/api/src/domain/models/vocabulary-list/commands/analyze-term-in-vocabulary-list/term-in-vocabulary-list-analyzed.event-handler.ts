import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
import { TermInVocabularyListAnalyzed } from './term-in-vocabulary-list-analyzed.event';

@CoscradEventConsumer('TERM_IN_VOCABULARY_LIST_ANALYZED')
export class TermInVocabularyListAnalyzedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly repository: IVocabularyListQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: vocabularyListId },
            termId,
            propertyValues,
        },
    }: TermInVocabularyListAnalyzed): Promise<void> {
        await this.repository.analyzeTerm(vocabularyListId, termId, propertyValues);
    }
}
