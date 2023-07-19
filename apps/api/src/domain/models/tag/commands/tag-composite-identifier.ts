import { AggregateType } from '@coscrad/api-interfaces';
import { UUID } from '@coscrad/data-types';
import { AggregateTypeProperty } from '../../shared/common-commands';

export class TagCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.tag])
    type = AggregateType.tag;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}
