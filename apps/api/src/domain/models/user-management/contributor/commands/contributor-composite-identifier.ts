import { AggregateType } from '@coscrad/api-interfaces';
import { UUID } from '@coscrad/data-types';
import { AggregateTypeProperty } from '../../../shared/common-commands';

export class ContributorCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.contributor])
    type = AggregateType.contributor;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}
