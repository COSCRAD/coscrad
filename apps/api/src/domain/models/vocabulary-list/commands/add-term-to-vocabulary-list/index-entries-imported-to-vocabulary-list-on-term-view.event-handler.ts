import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    ITermQueryRepository,
    TERM_QUERY_REPOSITORY_TOKEN,
} from '../../../term/queries/term-query-repository.interface';
import { EntriesImportedToVocabularyList } from '../import-entries-to-vocabulary-list';

@CoscradEventConsumer('ENTRIES_IMPORTED_TO_VOCABULARY_LIST')
export class IndexEntriesImportedToVocabularyListOnTermViewEventHandler
    implements ICoscradEventHandler
{
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN)
        private readonly termQueryRepository: ITermQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: vocabularyListId },
            entries,
        },
    }: EntriesImportedToVocabularyList): Promise<void> {
        const termIds = entries.map(({ termId }) => termId);

        await this.termQueryRepository.indexVocabularyLists(termIds, vocabularyListId);
    }
}
