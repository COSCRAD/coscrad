import { AggregateType } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../../types/DeepPartial';
import {
    LineItemsImportedToTranscript,
    LineItemsImportedToTranscriptPayload,
} from '../../../../shared/commands/transcripts/import-line-items-to-transcript/line-items-imported-to-transcript.event';

export const buildLineItemsImportedToTranscript = (
    payloadOverrides: DeepPartial<LineItemsImportedToTranscriptPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: LineItemsImportedToTranscriptPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: buildDummyUuid(1),
        },
        // we leave this blank to make overriding simple
        lineItems: [],
    };

    return new LineItemsImportedToTranscript(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
