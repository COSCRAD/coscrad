import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AudioAddedForNote, AudioAddedForNotePayload } from '../../commands';

export const buildAudioAddedForNote = (
    payloadOverrides: DeepPartial<AudioAddedForNotePayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: AudioAddedForNotePayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.note,
            id: buildDummyUuid(2),
        },
        audioItemId: '',
        languageCode: LanguageCode.Chilcotin,
    };

    return new AudioAddedForNote(
        {
            ...clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        },
        buildMetadata()
    );
};
