import { AggregateType } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { TagRelabelled, TagRelabelledPayload } from '../../commands';

export const buildTagRelabelled = (
    payloadOverrides: DeepPartial<TagRelabelled['payload']>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: TagRelabelledPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.tag,
            id: buildDummyUuid(1),
        },
        newLabel: 'birds',
    };

    return new TagRelabelled(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
