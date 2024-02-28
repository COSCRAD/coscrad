import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import {
    LineItemAddedToTranscript,
    LineItemAddedToTranscriptPayload,
} from '../../../../shared/commands/transcripts/add-line-item-to-transcript/line-item-added-to-transcript.event';

export const buildLineItemAddedToTranscript = (
    payloadOverrides: LineItemAddedToTranscriptPayload,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: LineItemAddedToTranscriptPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: buildDummyUuid(1),
        },
        inPointMilliseconds: 12544,
        outPointMilliseconds: 13234,
        text: 'This is what they said.',
        languageCode: LanguageCode.Chilcotin,
        speakerInitials: 'AP',
    };

    return new LineItemAddedToTranscript(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
