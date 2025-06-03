import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { ImportEntriesToVocabularyList } from './import-entries-to-vocabulary-list.command';

export type EntriesImportedToVocabularyListPayload = ImportEntriesToVocabularyList;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<EntriesImportedToVocabularyList>({
    example: {
        type: 'ENTRIES_IMPORTED_TO_VOCABULARY_LIST',
        id: testEventId,
        meta: {
            id: testEventId,
            userId: buildDummyUuid(22),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(10),
                type: AggregateType.vocabularyList,
            },
            entries: [],
        },
    },
})
@CoscradEvent('ENTRIES_IMPORTED_TO_VOCABULARY_LIST')
export class EntriesImportedToVocabularyList extends BaseEvent<EntriesImportedToVocabularyListPayload> {
    readonly type = 'ENTRIES_IMPORTED_TO_VOCABULARY_LIST';
}
