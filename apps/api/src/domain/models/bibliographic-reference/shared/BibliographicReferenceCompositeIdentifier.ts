import { UUID } from '@coscrad/data-types';
import { AggregateType } from '../../../types/AggregateType';
import { AggregateTypeProperty } from '../../shared/common-commands';

export class BibliographicReferenceCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.bibliographicReference])
    type = AggregateType.bibliographicReference;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}
