import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../domain/common';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { CreateVideo } from './create-video.command';

export type VideoCreatedPayload = CreateVideo;

const testEventId = buildDummyUuid(4);

@CoscradDataExample<VideoCreated>({
    example: {
        id: testEventId,
        type: 'VIDEO_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(3),
                type: AggregateType.video,
            },
            mediaItemId: buildDummyUuid(5),
            lengthMilliseconds: 12000,
            name: 'name of video',
            languageCodeForName: LanguageCode.Chilcotin,
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(6),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('VIDEO_CREATED')
export class VideoCreated extends BaseEvent<VideoCreatedPayload> {
    readonly type = 'VIDEO_CREATED';
}
