import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../../types/DeepPartial';
import {
    AudioItemNameTranslated,
    AudioItemNameTranslatedPayload,
} from '../../../commands/translate-audio-item-name/audio-item-name-translated-event';

export const buildAudioItemNameTranslated = (
    payloadOverrides: DeepPartial<AudioItemNameTranslatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: AudioItemNameTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: buildDummyUuid(1),
        },
        text: 'Translation of Audio Item Name',
        languageCode: LanguageCode.English,
    };

    return new AudioItemNameTranslated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
