import { AggregateType } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../../types/DeepPartial';
import {
    TranscriptCreated,
    TranscriptCreatedPayload,
} from '../../../../shared/commands/transcripts/create-transcript/transcript-created.event';

export const buildTranscriptCreated = (
    payloadOverrides: DeepPartial<TranscriptCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: TranscriptCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: buildDummyUuid(1),
        },
    };

    return new TranscriptCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
