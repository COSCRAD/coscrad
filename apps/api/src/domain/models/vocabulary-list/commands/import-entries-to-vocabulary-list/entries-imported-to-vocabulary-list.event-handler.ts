import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
import { EntriesImportedToVocabularyList } from './entries-imported-to-vocabulary-list.event';

@CoscradEventConsumer('ENTRIES_IMPORTED_TO_VOCABULARY_LIST')
export class EntriesImportedToVocabularyListEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly repository: IVocabularyListQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: vocabularyListId },
            entries,
        },
    }: EntriesImportedToVocabularyList): Promise<void> {
        await this.repository.importEntries(vocabularyListId, entries);
    }
}
