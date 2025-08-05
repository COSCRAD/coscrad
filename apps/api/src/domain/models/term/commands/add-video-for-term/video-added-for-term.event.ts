import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { AddVideoForTerm } from './add-video-for-term.command';

export type VideoAddedForTermPayload = AddVideoForTerm;

const testEventId = buildDummyUuid(5);

@CoscradDataExample<VideoAddedForTerm>({
    example: {
        type: 'VIDEO_ADDED_FOR_TERM',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: { type: AggregateType.term, id: buildDummyUuid(8) },
            videoId: buildDummyUuid(7),
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(9),
            dateCreated: dummyDateNow,
            contributorIds: [],
        },
    },
})
@CoscradEvent('VIDEO_ADDED_FOR_TERM')
export class VideoAddedForTerm extends BaseEvent<VideoAddedForTermPayload> {
    readonly type = 'VIDEO_ADDED_FOR_TERM';
}
