import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../domain/common';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { TranslateVideoName } from './translate-video-name.command';

export type VideoNameTranslatedPayload = TranslateVideoName;

const testEventId = buildDummyUuid(4);

@CoscradDataExample<VideoNameTranslated>({
    example: {
        id: testEventId,
        type: 'VIDEO_NAME_TRANSLATED',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.video,
                id: buildDummyUuid(3),
            },
            text: 'text of translation for video name',
            languageCode: LanguageCode.English,
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(2),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('VIDEO_NAME_TRANSLATED')
export class VideoNameTranslated extends BaseEvent<VideoNameTranslatedPayload> {
    readonly type = 'VIDEO_NAME_TRANSLATED';
}
