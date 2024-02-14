import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { AggregateType } from '../../../../types/AggregateType';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { TagCreated } from '../../commands/create-tag/tag-created.event';

export const buildTagCreatedEvent = (
    payloadOverrides: DeepPartial<TagCreated['payload']>,
    buildMetadata: EventMetadataBuilder
) =>
    new TagCreated(
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier: {
                    type: AggregateType.tag,
                    id: buildDummyUuid(9),
                },
                label: 'birds',
            } as TagCreated['payload'],
            payloadOverrides
        ),
        buildMetadata()
    );
