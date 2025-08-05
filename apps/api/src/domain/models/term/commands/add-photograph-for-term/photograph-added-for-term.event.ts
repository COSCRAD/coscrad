import { AggregateType } from '@coscrad/api-interfaces';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { AddPhotograhForTerm } from './add-photograph-for-term.command';

export type PhotographAddedForTermPayload = AddPhotograhForTerm;

const testEventId = buildDummyUuid(416);

@CoscradDataExample<PhotographAddedForTerm>({
    example: {
        type: 'PHOTOGRAPH_ADDED_FOR_TERM',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: { type: AggregateType.term, id: buildDummyUuid(5) },
            photographId: buildDummyUuid(6),
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(8),
            dateCreated: dummyDateNow,
            contributorIds: [],
        },
    },
})
@CoscradEvent(`PHOTOGRAPH_ADDED_FOR_TERM`)
export class PhotographAddedForTerm extends BaseEvent<PhotographAddedForTermPayload> {
    readonly type = 'PHOTOGRAPH_ADDED_FOR_TERM';
}
