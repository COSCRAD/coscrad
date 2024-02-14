import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { AggregateType } from '../../../../types/AggregateType';
import { ResourceType } from '../../../../types/ResourceType';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    ResourceOrNoteTagged,
    ResourceOrNoteTaggedPayload,
} from '../../commands/tag-resource-or-note/resource-or-note-tagged.event';

export const buildResourceOrNoteTagged = (
    payloadOverrides: DeepPartial<ResourceOrNoteTagged['payload']>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: ResourceOrNoteTaggedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.tag,
            id: buildDummyUuid(1),
        },
        taggedMemberCompositeIdentifier: {
            type: ResourceType.digitalText,
            id: buildDummyUuid(2),
        },
    };

    return new ResourceOrNoteTagged(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
