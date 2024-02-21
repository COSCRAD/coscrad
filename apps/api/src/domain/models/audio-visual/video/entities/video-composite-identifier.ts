import { AggregateType } from '@coscrad/api-interfaces';
import { UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { AggregateTypeProperty } from '../../../shared/common-commands';

export class VideoCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.video])
    type = AggregateType.video;

    @UUID({
        label: 'ID',
        description: 'the video ID (generated)',
    })
    id: AggregateId;
}
