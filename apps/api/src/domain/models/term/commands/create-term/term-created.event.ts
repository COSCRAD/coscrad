import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TERM_CREATED } from './constants';
import { CreateTerm } from './create-term.command';

export type TermCreatedPayload = CreateTerm;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<TermCreated>({
    example: {
        id: testEventId,
        type: 'TERM_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.term,
                id: buildDummyUuid(89),
            },
            text: 'roll it to me',
            languageCode: LanguageCode.Chilcotin,
        },
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            userId: buildDummyUuid(2),
            contributorIds: [],
        },
    },
})
@CoscradEvent(TERM_CREATED)
export class TermCreated extends BaseEvent<TermCreatedPayload> {
    readonly type = 'TERM_CREATED';
}
