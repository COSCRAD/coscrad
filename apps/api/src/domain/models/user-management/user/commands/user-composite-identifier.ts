import { UUID } from '@coscrad/data-types';
import { AggregateType } from '../../../../types/AggregateType';
import { AggregateTypeProperty } from '../../../shared/common-commands';

export class UserCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.user])
    type = AggregateType.user;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}
