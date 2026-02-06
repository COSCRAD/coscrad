import { AggregateType } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    EdgePublished,
    EdgePublishedPayload,
} from '../../commands/publish-note/edge-published.event';

export const buildEdgePublished = (
    payloadOverrides: DeepPartial<EdgePublishedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: EdgePublishedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.note,
            id: buildDummyUuid(2),
        },
    };

    return new EdgePublished(
        {
            ...clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        },
        buildMetadata()
    );
};
