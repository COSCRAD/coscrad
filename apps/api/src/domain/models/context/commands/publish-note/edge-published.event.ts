import { AggregateType } from '@coscrad/api-interfaces';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { PublishEdge } from './publish-edge.command';

export type NotePublishedPayload = PublishEdge;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<EdgePublished>({
    example: {
        id: testEventId,
        type: 'EDGE_PUBLISHED',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.note,
                id: buildDummyUuid(4),
            },
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(99),
            dateCreated: dummyDateNow,
        },
    },
})
export class EdgePublished extends BaseEvent<NotePublishedPayload> {
    readonly type = 'EDGE_PUBLISHED';
}
