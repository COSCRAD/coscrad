import { NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class AudioItemCompositeIdentifier {
    @NonEmptyString({
        label: 'type',
        description: 'audio item',
    })
    type = AggregateType.audioItem;

    @UUID({
        label: 'ID',
        description: 'the audio item ID (generated)',
    })
    id: AggregateId;
}

export class AudioVisualCompositeIdentifier {
    @NonEmptyString({
        label: 'type',
        description: 'audio item | video',
    })
    type: typeof AggregateType.video | typeof AggregateType.audioItem;

    @UUID({
        label: 'ID',
        description: `the audio visual resource's ID (generated)`,
    })
    id: AggregateId;
}
