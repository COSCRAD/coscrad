import { NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class AudioItemCompositeIdentifier {
    @NonEmptyString({
        label: 'type',
        description: 'transcript',
    })
    type = AggregateType.audioItem;

    @UUID({
        label: 'ID',
        description: 'the transcript ID (generated)',
    })
    id: AggregateId;
}
