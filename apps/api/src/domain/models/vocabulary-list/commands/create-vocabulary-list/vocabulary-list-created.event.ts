import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateVocabularyList } from './create-vocabulary-list.command';

export type VocabularyListCreatedPayload = CreateVocabularyList;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<VocabularyListCreated>({
    example: {
        id: testEventId,
        type: 'VOCABULARY_LIST_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.vocabularyList,
                id: buildDummyUuid(45),
            },
            name: 'one awesome verb paradigm',
            languageCodeForName: LanguageCode.Chilcotin,
        },
        meta: {
            userId: buildDummyUuid(333),
            contributorIds: [],
            dateCreated: dummyDateNow,
            id: testEventId,
        },
    },
})
// @CoscradEvent((e)=> e.type === 'VOCABULARY_LIST_CREATED',{ contributionStatementTemplate: "created by $fullname"})
@CoscradEvent(`VOCABULARY_LIST_CREATED`)
export class VocabularyListCreated extends BaseEvent<VocabularyListCreatedPayload> {
    readonly type = 'VOCABULARY_LIST_CREATED';
}
