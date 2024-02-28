import { AggregateType } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../../types/DeepPartial';
import {
    ParticipantAddedToTranscript,
    ParticipantAddedToTranscriptPayload,
} from '../../../../shared/commands/transcripts/add-participant-to-transcript/participant-added-to-transcript.event';

export const buildPArticipantAddedToTranscript = (
    payloadOverrides: DeepPartial<ParticipantAddedToTranscriptPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: ParticipantAddedToTranscriptPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: buildDummyUuid(1),
        },
        initials: 'JD',
        name: 'Jane Doggy',
    };

    return new ParticipantAddedToTranscript(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
