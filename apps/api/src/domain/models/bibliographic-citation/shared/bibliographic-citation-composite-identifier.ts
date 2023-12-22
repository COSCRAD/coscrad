import { UUID } from '@coscrad/data-types';
import { AggregateType } from '../../../types/AggregateType';
import { AggregateTypeProperty } from '../../shared/common-commands';

export class BibliographicCitationCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.bibliographicCitation])
    type = AggregateType.bibliographicCitation;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}
