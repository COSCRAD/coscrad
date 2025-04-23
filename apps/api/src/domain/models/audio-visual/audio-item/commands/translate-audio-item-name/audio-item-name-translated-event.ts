import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../domain/common';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import { DTO } from '../../../../../../types/DTO';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { TranslateAudioItemName } from './translate-audio-item-name.command';

export type AudioItemNameTranslatedPayload = TranslateAudioItemName;

const fixtureEventId = buildDummyUuid(2);

@CoscradDataExample<AudioItemNameTranslated>({
    example: {
        id: fixtureEventId,
        type: 'AUDIO_ITEM_NAME_TRANSLATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(1),
                type: AggregateType.audioItem,
            },
            text: 'the translation for this test audio item',
            languageCode: LanguageCode.English,
        },
        meta: {
            id: fixtureEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(38),
        },
    },
})
@CoscradEvent('AUDIO_ITEM_NAME_TRANSLATED')
export class AudioItemNameTranslated extends BaseEvent<AudioItemNameTranslatedPayload> {
    readonly type = 'AUDIO_ITEM_NAME_TRANSLATED';

    public static fromDto(dto: DTO<AudioItemNameTranslated>) {
        if (!dto) return;

        const { payload, meta } = dto;

        return new AudioItemNameTranslated(payload, meta);
    }
}
