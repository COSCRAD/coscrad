import { NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class VideoCompositeIdentifier {
    @NonEmptyString({
        label: 'type',
        description: 'video',
    })
    type = AggregateType.video;

    @UUID({
        label: 'ID',
        description: 'the video ID (generated)',
    })
    id: AggregateId;
}
