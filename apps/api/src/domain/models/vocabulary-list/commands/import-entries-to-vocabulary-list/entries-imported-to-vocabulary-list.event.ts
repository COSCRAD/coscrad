import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { ImportEntriesToVocabularyList } from './import-entries-to-vocabulary-list.command';

export type EntriesImportedToVocabularyListPayload = ImportEntriesToVocabularyList;

@CoscradEvent('ENTRIES_IMPORTED_TO_VOCABULARY_LIST')
export class EntriesImportedToVocabularyList extends BaseEvent<EntriesImportedToVocabularyListPayload> {
    readonly type = 'ENTRIES_IMPORTED_TO_VOCABULARY_LIST';
}
