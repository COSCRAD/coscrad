import { UUID } from '@coscrad/data-types';
import { AggregateType } from '../../../../types/AggregateType';
import { AggregateTypeProperty } from '../../../shared/common-commands';

export class UserGroupCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.userGroup])
    type = AggregateType.userGroup;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}
