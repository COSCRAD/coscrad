import { ExternalEnum, NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { AggregateTypeProperty } from '../../shared/common-commands';

const audiovisualResourceTypes = [ResourceType.video, ResourceType.audioItem] as const;

export type AudiovisualResourceType = typeof audiovisualResourceTypes[number];

export class AudioItemCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.audioItem])
    type = AggregateType.audioItem;

    @UUID({
        label: 'ID',
        description: 'the audio item ID (generated)',
    })
    id: AggregateId;
}

export class AudioVisualCompositeIdentifier {
    @ExternalEnum(
        {
            labelsAndValues: [
                {
                    label: 'video',
                    value: ResourceType.video,
                },
                {
                    label: 'audio item',
                    value: ResourceType.audioItem,
                },
            ],
            enumName: 'AudiovisualResourceType',
            enumLabel: 'Audiovisual Resource Type',
        },
        {
            label: 'Audiovisual Resource Type',
            description: 'the resource type of the audiovisual item',
        }
    )
    @NonEmptyString({
        label: 'type',
        description: 'audio item | video',
    })
    type: AudiovisualResourceType;

    @UUID({
        label: 'ID',
        description: `the audio visual resource's ID (generated)`,
    })
    id: AggregateId;
}
