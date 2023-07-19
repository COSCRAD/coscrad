import { UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { AggregateTypeProperty } from '../../shared/common-commands';

export class VideoCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.video])
    type = AggregateType.video;

    @UUID({
        label: 'ID',
        description: 'the video ID (generated)',
    })
    id: AggregateId;
}
